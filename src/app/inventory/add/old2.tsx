"use client";

import { useState } from "react";
import { getAuth, signInAnonymously } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Asegúrate de que este path sea correcto

export default function FirestoreTestPage() {
  const [status, setStatus] = useState("");

  const testFirestoreWrite = async () => {
    setStatus("Iniciando prueba...");

    try {
      const auth = getAuth();

      // 1. Autenticación anónima
      const result = await signInAnonymously(auth);
      const user = result.user;
      console.log("UID:", user.uid);

      // 2. Documento completo cumpliendo con tus reglas
      const testData = {
        assetTag: "TEST-001",
        computerName: "Prueba-PC",
        processor: "Intel i5",
        ramSize: 8,
        storageType: "SSD",
        storageSize: 256,
        uefiSupport: true,
        secureBootEnabled: true,
        isCompatible: true,
        verifiedByTool: true,
        userId: user.uid,
        observations: "Test desde componente",
        tpmVersion: "2.0"
        // ⚠️ NO incluye createdAt ni updatedAt por reglas
      };

      console.log("Datos a enviar:", testData);

      const docRef = await addDoc(collection(db, "computers"), testData);
      setStatus(`✅ Documento creado con ID: ${docRef.id}`);
    } catch (error: any) {
      console.error("❌ Error:", error);
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prueba de escritura en Firestore</h1>
      <button
        onClick={testFirestoreWrite}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Ejecutar prueba
      </button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
