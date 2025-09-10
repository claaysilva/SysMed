import React, { useState, useEffect } from "react";
import axios from "axios";

// Vamos definir o formato de um objeto Paciente para usar com TypeScript
interface Patient {
    id: number;
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
}

const PatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]); // Estado para guardar a lista de pacientes

    // useEffect para buscar os dados na API quando a página carregar
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem("authToken"); // Pega o token salvo
                const response = await axios.get(
                    "http://localhost:8000/api/patients",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Envia o token para a API
                        },
                    }
                );
                setPatients(response.data); // Guarda a lista de pacientes no estado
            } catch (error) {
                console.error("Erro ao buscar pacientes:", error);
                // Adicionar lógica para lidar com erro (ex: token expirado)
            }
        };

        fetchPatients();
    }, []); // O array vazio [] faz com que isso rode apenas uma vez

    return (
        <div>
            <h2>Gestão de Pacientes</h2>
            <button>Adicionar Paciente</button>
            <table style={{ width: "100%", marginTop: "1rem" }}>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Data de Nascimento</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient) => (
                        <tr key={patient.id}>
                            <td>{patient.nome_completo}</td>
                            <td>{patient.cpf}</td>
                            <td>{patient.data_nascimento}</td>
                            <td>
                                <button>Editar</button>
                                <button>Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PatientsPage;
