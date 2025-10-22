from django.db import models


class Curso(models.Model):
    nome = models.CharField(max_length=35)
    def __str__(self):
        return self.nome
    
class Hobby(models.Model):
    nome = models.CharField(max_length=100)
    def __str__(self):
        return self.nome
    
class Card(models.Model):
    # bases
    nome = models.CharField(max_length=50)
    insta = models.CharField(max_length=20)
    idade = models.IntegerField(default=0)
    hobbies = models.ManyToManyField(Hobby)
    bio = models.TextField(max_length=150)
    musica_fav = models.CharField(max_length=100)

    # personalizacao do card
    cor_fundo = models.CharField(default="#3f3f3f", max_length=7)
    cor_texto =  models.CharField(default="#FFFFFF", max_length=7)
    cor_destaque = models.CharField(default="#1E90FF", max_length=7)
    gradiente = models.BooleanField(default=False)
    
    # media
    foto = models.ImageField(upload_to='fotos', null=True, blank=True)
    curtidas = models.PositiveIntegerField(default=0, null=True, blank=True)

    # curso
    PERIODO_CHOICE = [
        ('1', '1° Ano'),
        ('2', '2° Ano'),
        ('3', '3° Ano'),
        ('4', '4° Ano'),
        ('5', 'Já Formado'),
    ]
    periodo = models.CharField(max_length=2, choices=PERIODO_CHOICE, null=True, blank=True)
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return f"{self.nome} ({self.insta if self.insta else ''})"

class Comentario(models.Model):
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="comentarios")
    user = models.CharField(max_length=50, default="Anônimo")
    conteudo = models.TextField()
    data = models.DateTimeField(auto_now_add=True)