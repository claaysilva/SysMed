<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Importe a classe Auth

class AuthController extends Controller
{
    /**
     * Lida com a tentativa de autenticação de um usuário.
     */
    public function login(Request $request)
    {
        // 1. Valida os dados que chegaram (email e senha são obrigatórios)
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Tenta autenticar o usuário com as credenciais fornecidas
        if (Auth::attempt($credentials)) {
            // 3. Se a autenticação for bem-sucedida...
            $user = Auth::user();
            // Cria um token de acesso para o usuário
            $token = $user->createToken('authToken')->plainTextToken;

            // Retorna uma resposta de sucesso com o token e os dados do usuário
            return response()->json([
                'message' => 'Login bem-sucedido!',
                'user' => $user,
                'token' => $token,
            ]);
        }

        // 4. Se a autenticação falhar...
        // Retorna um erro de "Não autorizado"
        return response()->json(['message' => 'Credenciais inválidas'], 401);
    }
}