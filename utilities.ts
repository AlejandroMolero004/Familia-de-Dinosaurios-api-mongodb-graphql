import { Collection, ObjectId } from "mongodb";
import { Dinosaurio, Dinosauriodb, familia, familiadb } from "./types.ts";

export const frommodeltodino=(dinodb:Dinosauriodb):Dinosaurio=>{
    return {
        _id:dinodb._id!.toString(),
        id:dinodb.id,
        nombre:dinodb.nombre,
        tipo:dinodb.tipo
    }
}
export const frommodeltofamilia=async(familiadb:familiadb,dinos:Collection<Dinosauriodb>):Promise<familia|string>=>{
    const d:(Dinosaurio|null)[]=await Promise.all(
        familiadb.integrantes.map(async(elem:ObjectId)=>{
            const dinosaurioDb = await dinos.findOne({ _id: elem });
            if (!dinosaurioDb) {
              return null; // Si no se encuentra el dinosaurio, se puede manejar el caso
            }
            return frommodeltodino(dinosaurioDb);
        }));
    if (!d) {
            return "Algunos dinosaurios no se encontraron";
    }

    return{
        _id:familiadb._id?.toString(),
        nombre:familiadb.nombre,
        integrantes:d
    }
    
}