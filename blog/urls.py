from django.urls import path
from .views import new_card, cards_list, index
from .views import comentarios_list, new_comentario, like_card


urlpatterns = [
    path("", index, name="index"),
    path('cards/', cards_list, name="cards_list"),
    path('cards/new/', new_card, name="new_card"),

    # Comentários
    path("cards/comentarios/", comentarios_list, name="comentarios-list"),  # usa query param ?card_id=
    path("cards/comentarios/<int:card_id>/", comentarios_list, name="comentarios-list-by-card"),  # opcional por URL

    # Criar comentário
    path("cards/comentarios/criar/", new_comentario, name="new-comentario"),

    # Curtidas (likes)
    path("cards/curtir/<int:card_id>/", like_card, name="like-card"),
]                                                                      