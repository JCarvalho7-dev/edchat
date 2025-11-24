import React, { useState } from "react";
import logo from "../assets/logo.png";

export default function EDChatLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("edchat_token", data.token);
        alert("Login realizado!");
        // TODO: redirect to chat/dashboard
      } else {
        alert(data.message || "Erro no login");
      }
    } catch (err) {
      alert("Erro ao conectar com backend");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2F2551] via-[#AB005B] to-[#D54D9C] p-6">
      <div className="w-full max-w-4xl bg-white/95 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left: Branding */}
        <div className="hidden md:flex flex-col items-center justify-center gap-6 p-10 bg-gradient-to-b from-white/10 to-white/5">
          <img
            src={logo}
            alt="Logo Estrutura Dinâmica - ED Chat"
            className="w-36 h-36 object-contain"
          />
          <h1 className="text-3xl font-semibold text-[#2F2551]">ED Chat</h1>
          <p className="text-sm text-[#2F2551]/80 text-center max-w-sm">
            Plataforma de comunicação empresarial da Estrutura Dinâmica. Acesse com seu login e senha para
            participar dos grupos autorizados.
          </p>
        </div>

        {/* Right: Form */}
        <div className="flex flex-col justify-center p-10">
          <div className="md:hidden flex items-center gap-4 mb-6">
            <img
              src={logo}
              alt="ED Chat logo mobile"
              className="w-14 h-14 object-contain"
            />
            <div>
              <h2 className="text-xl font-semibold text-[#2F2551]">ED Chat</h2>
              <p className="text-xs text-[#2F2551]/80">Comunicação segura e monitorada para sua equipe</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-[#2F2551] mb-4">Entrar na sua conta</h3>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-[#2F2551]/90">E-mail ou usuário</label>
              <input
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                type="text"
                placeholder="seu.usuario@empresa.com"
                className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#AB005B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2F2551]/90">Senha</label>
              <input
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#AB005B]"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#2F2551]/80">
                <input type="checkbox" className="h-4 w-4 text-[#AB005B]" />
                Lembrar meu login
              </label>
              <button type="button" className="text-[#2F2551]/80 hover:underline">
                Esqueci a senha
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold shadow-sm text-white bg-gradient-to-r from-[#AB005B] to-[#D54D9C] hover:opacity-95 focus:outline-none"
              >
                Entrar no ED Chat
              </button>
            </div>

            <div className="text-center text-xs text-[#2F2551]/70">
              <p>
                Ao entrar, você concorda com a política de uso da ED Chat — as conversas podem ser monitoradas pelo
                administrador.
              </p>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-[#2F2551]/80">
            <p>
              Para acesso de administrador use a <span className="font-medium">Senha Master</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
