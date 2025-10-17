from django.urls import path
from .views import new_card, cards_list, index


urlpatterns = [
    path("", index, name="index"),
    path('cards/', cards_list, name="cards_list"),
    path('cards/new/', new_card, name="new_card"),
]