"use client";

import { useState, useEffect } from "react";
import Chore from "@/components/Chore";

interface ChoreType {
  _id: string;
  name: string;
}

export default function ChorePage() {
  const [chores, setChores] = useState<ChoreType[]>([]); 

  useEffect(() => {
    async function fetchChores() {
      const response = await fetch("http://localhost:50001/api/chores");
      if (response.ok) {
        const data: ChoreType[] = await response.json(); 
        setChores(data);
      }
    }
    fetchChores();
  }, []);

  return (
    <div>
      <h1>Chore List</h1>
      <ul>
        {chores.map((chore) => (
          <li key={chore._id}>{chore.name}</li> 
        ))}
      </ul>
      <Chore />
    </div>
  );
}