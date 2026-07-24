"""Coleção Postman v2.1 de exemplo (fluxo de e-commerce) usada no seed."""

DEMO_COLLECTION: dict = {
    "info": {
        "name": "API de Pedidos — E-commerce",
        "description": "Fluxo completo de compra: autenticar, criar pedido, consultar e cancelar.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "variable": [
        {"key": "baseUrl", "value": "https://api.loja.com"},
        {"key": "token", "value": ""},
        {"key": "pedidoId", "value": ""},
    ],
    "item": [
        {
            "name": "Autenticação",
            "item": [
                {
                    "name": "Login",
                    "request": {
                        "method": "POST",
                        "url": {"raw": "{{baseUrl}}/auth/login", "host": ["{{baseUrl}}"], "path": ["auth", "login"]},
                        "description": "Autentica o usuário e retorna um token de acesso.",
                        "body": {"mode": "raw", "raw": '{\n  "email": "cliente@loja.com",\n  "senha": "senha123"\n}'},
                    },
                    "event": [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "pm.test('Status 200', function () { pm.response.to.have.status(200); });",
                                    "pm.test('Retorna token de acesso', function () {",
                                    "  pm.expect(pm.response.json()).to.have.property('accessToken');",
                                    "});",
                                    "pm.collectionVariables.set('token', pm.response.json().accessToken);",
                                ]
                            },
                        }
                    ],
                }
            ],
        },
        {
            "name": "Pedidos",
            "item": [
                {
                    "name": "Criar pedido",
                    "request": {
                        "method": "POST",
                        "url": {"raw": "{{baseUrl}}/pedidos", "host": ["{{baseUrl}}"], "path": ["pedidos"]},
                        "description": "Cria um novo pedido com os itens do carrinho.",
                        "body": {"mode": "raw", "raw": '{\n  "itens": [{"sku": "ABC-1", "qtd": 2}],\n  "cupom": "PROMO10"\n}'},
                    },
                    "event": [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "pm.test('Pedido criado (201)', function () { pm.response.to.have.status(201); });",
                                    "pm.test('Retorna id do pedido', function () {",
                                    "  pm.expect(pm.response.json()).to.have.property('id');",
                                    "});",
                                    "pm.test('Desconto do cupom aplicado', function () {",
                                    "  pm.expect(pm.response.json().total).to.be.below(pm.response.json().subtotal);",
                                    "});",
                                    "pm.collectionVariables.set('pedidoId', pm.response.json().id);",
                                ]
                            },
                        }
                    ],
                },
                {
                    "name": "Consultar pedido",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/pedidos/{{pedidoId}}",
                            "host": ["{{baseUrl}}"],
                            "path": ["pedidos", "{{pedidoId}}"],
                        },
                        "description": "Consulta os detalhes e o status do pedido recém-criado.",
                    },
                    "event": [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "pm.test('Status 200', function () { pm.response.to.have.status(200); });",
                                    "pm.test('Pedido está pendente de pagamento', function () {",
                                    "  pm.expect(pm.response.json().status).to.eql('aguardando_pagamento');",
                                    "});",
                                ]
                            },
                        }
                    ],
                },
                {
                    "name": "Cancelar pedido",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/pedidos/{{pedidoId}}",
                            "host": ["{{baseUrl}}"],
                            "path": ["pedidos", "{{pedidoId}}"],
                        },
                        "description": "Cancela o pedido enquanto ele ainda não foi pago.",
                    },
                    "event": [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "pm.test('Cancelamento aceito (204)', function () { pm.response.to.have.status(204); });",
                                ]
                            },
                        }
                    ],
                },
            ],
        },
    ],
}
