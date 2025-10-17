from rest_framework import serializers
from blog.models import Curso


# transforma os dados do modelo curso em JSON
class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = '__all__'