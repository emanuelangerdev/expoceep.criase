from django import forms
from .models import Card, Hobby, Curso

class CardForm(forms.ModelForm):
    class Meta:
        model = Card
        fields = '__all__'
        widgets = {
            'nome': forms.TextInput(attrs={'placeholder': 'Nome completo'}),
            'insta': forms.TextInput(attrs={'placeholder': 'usuario sem @'}),
            'idade': forms.NumberInput(attrs={'min': 0, 'max': 120}),
            'hobbies': forms.CheckboxSelectMultiple(),
            'bio': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Uma bio curta (máx. 500 caracteres)'}),
            'musica_favorita': forms.TextInput(attrs={'placeholder': 'Música favorita'}),
            'cor_fundo': forms.TextInput(attrs={'type': 'color'}),
            'cor_destaque': forms.TextInput(attrs={'type': 'color'}),
            'gradiente': forms.CheckboxInput(),
            'cor_texto': forms.TextInput(attrs={'type': 'color'}),
            'foto': forms.ClearableFileInput(attrs={'accept': 'image/*'}),
            'periodo': forms.Select(),
            'curso': forms.Select(),
        }
        labels = {
            'musica_favorita': 'Música favorita',
            'cor_fundo': 'Cor de fundo do card',
            'cor_texto': 'Cor do texto do card'
        }
        help_texts = {
            'insta': 'Sem @ — apenas o nome de usuário (ex: joao.silva)',
            'hobbies': 'Marque um ou mais hobbies',
        }