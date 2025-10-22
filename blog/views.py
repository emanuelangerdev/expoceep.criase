from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db import transaction
from django.db.models.functions import Coalesce
from django.db.models import F
from django.contrib import messages
from django.http import JsonResponse
from .models import Card, Comentario
from .forms import CardForm
import logging
import json

# página inicial
def index(request):
    return render(request, 'card/index.html')

# lista de cards
def cards_list(request):
    cards = Card.objects.all()
    
    context = {'cards': cards}
    return render(request, 'card/cards_list.html', context)
    
# criar card
def new_card(request):
    if request.method == 'POST':
        form = CardForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('cards_list')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"Erro em {field}: {error}")
    else: 
        form = CardForm()

    context = {'form': form}
    return render(request, 'card/new_card.html', context)

def comentarios_list(request, card_id=None):
    """
    Retorna lista de comentários.
    Aceita card_id via URL (path param) ou via querystring ?card_id=...
    """
    # Prioriza param da URL; senão usa querystring
    if not card_id:
        card_id = request.GET.get('card_id')

    if card_id:
        comentarios = Comentario.objects.filter(card_id=card_id).select_related('card')
    else:
        comentarios = Comentario.objects.all().select_related('card')

    comentarios_data = []
    for comentario in comentarios:
        # converte user para string (caso seja FK) e data para isoformat
        user_repr = str(comentario.user) if comentario.user is not None else "Anônimo"
        data_iso = comentario.data.isoformat() if hasattr(comentario.data, 'isoformat') else str(comentario.data)
        comentarios_data.append({
            'id': comentario.id,
            'conteudo': comentario.conteudo,
            'user': user_repr,
            'data': data_iso,
            'card_id': comentario.card_id
        })

    return JsonResponse({
        'comentarios': comentarios_data,
        'total_comentarios': len(comentarios_data)
    })


@require_POST
@csrf_exempt  # se quiser aplicar CSRF, remova esta linha e configure o token no front
def new_comentario(request):
    try:
        data = json.loads(request.body)

        card_id = data.get('card_id')
        conteudo = data.get('conteudo')
        user = data.get('user', 'Anônimo')

        if not card_id or not conteudo:
            return JsonResponse({'success': False, 'error': 'Card ID e conteúdo são obrigatórios'}, status=400)

        try:
            card = Card.objects.get(id=card_id)
        except Card.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Card não encontrado'}, status=400)

        comentario = Comentario.objects.create(card=card, user=user, conteudo=conteudo)

        return JsonResponse({
            'success': True,
            'comentario': {
                'id': comentario.id,
                'user': str(comentario.user),
                'conteudo': comentario.conteudo,
                'data': comentario.data.isoformat() if hasattr(comentario.data, 'isoformat') else str(comentario.data),
                'card_id': comentario.card.id
            }
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Dados JSON inválidos'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Erro interno: {str(e)}'}, status=500)


logger = logging.getLogger(__name__)
@require_POST
@csrf_exempt
def like_card(request, card_id):
    """
    Incrementa curtidas de forma segura:
    - trata curtidas NULL usando Coalesce
    - retorna mensagem de erro detalhada em JSON (apenas para dev)
    """
    try:
        # valida card existe
        try:
            card = Card.objects.get(id=card_id)
        except Card.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Card não encontrado'}, status=404)

        # Atualização atômica: substitui NULL por 0 antes de somar
        with transaction.atomic():
            Card.objects.filter(id=card_id).update(curtidas=Coalesce(F('curtidas'), 0) + 1)

        # read fresh
        card.refresh_from_db(fields=['curtidas'])

        return JsonResponse({'success': True, 'card_id': card.id, 'curtidas': card.curtidas})

    except Exception as e:
        # log detalhado no servidor (runserver)
        logger.exception("Erro ao processar like para card %s", card_id)
        # Retorna a mensagem para debugging (remova em produção)
        return JsonResponse({'success': False, 'error': f'Erro interno ao processar like: {str(e)}'}, status=500)