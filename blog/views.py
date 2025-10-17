from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Card
from .forms import CardForm

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