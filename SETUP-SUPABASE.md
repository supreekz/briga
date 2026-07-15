# Nomad Fight Picks - Supabase

Este site continua estatico. O Supabase entra apenas como banco online para salvar e listar os palpites.

## 1. Criar o projeto

1. Acesse https://supabase.com.
2. Crie um projeto.
3. Abra `SQL Editor`.
4. Cole e execute o conteudo de `supabase-fight-picks.sql`.

## 2. Copiar as chaves

No Supabase:

1. Abra `Project Settings`.
2. Abra `API`.
3. Copie `Project URL`.
4. Copie `anon public`.

Depois edite `public/assets/js/bets-config.js`:

```js
window.NOMAD_BETS_SUPABASE = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA_ANON_PUBLIC_KEY",
};
```

## 3. Rodar o site

Pode abrir com Live Server no VS Code usando `Go Live`.

Tambem funciona com:

```bash
python -m http.server 5500
```

Depois acesse:

```text
http://127.0.0.1:5500
```

## Observacao

O campo de valor e tratado como valor simbolico/interno. O site nao processa pagamento, nao cria odds, nao intermedeia Pix e nao confirma aposta real em dinheiro.
