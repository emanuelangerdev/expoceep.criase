from django.http import HttpResponseNotAllowed, JsonResponse, HttpResponse
# restframework imports
from rest_framework import generics, status
from rest_framework.parsers import JSONParser
# custom imports
from blog.models import Curso
from .serializers import CursoSerializer



# read-only endpoint criada manualmente
def CursoList(request):
    if request.method == "GET":
        queryset = Curso.objects.all()
        serializer = CursoSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)
    else: 
        # erro que deixa explicito que apenas GET é aceito
        return HttpResponseNotAllowed(['GET'])


# read-only endpoint com view genérica (CBV)
class CursoListView(generics.ListAPIView):
    queryset = Curso.objects.all()    
    serializer_class = CursoSerializer


# get/put/delete endpoint criada manualmente
def CursoDetail(request, pk):
    try:
        curso = Curso.objects.get(pk=pk)
    except Curso.DoesNotExist:
        return HttpResponse(status=404)
    
    # pega a instância curso e exibe em JSON
    if request.method == 'GET':
        serializer = CursoSerializer(curso)
        return JsonResponse(serializer.data)
    
    # Recebe os dados em JSON enviados pelo cliente e converte em dicionário Python.
    # O serializer valida esses dados e compara com o objeto existente no banco.
    # Se os dados forem válidos, o objeto Curso é atualizado com os novos valores.
    # Por fim, o objeto atualizado é convertido de volta em JSON e enviado como resposta.

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = CursoSerializer(curso, data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)
        return JsonResponse(serializer.erros, status=400)
    
    elif request.method == 'DELETE':
        curso.delete()
        return HttpResponse(status=204)
    

# get/put/delete endpoint com CBV
class CursoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer