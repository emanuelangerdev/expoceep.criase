from django.urls import path
from . import views

urlpatterns = [
    # read only
    path("curso/", views.CursoList, name="curso-list"),
    path("rest/curso/", views.CursoListView.as_view(), name="curso-list-view"),

    # get/put/delete 
    path("curso/<int:pk>/", views.CursoDetail, name="curso-update-delete"),
    path("rest/curso/<int:pk>/", views.CursoDetailView.as_view(), name="curso-update-delete-view")
]

