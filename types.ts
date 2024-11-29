import { ObjectId } from "mongodb";

export type Dinosauriodb={
    _id?:ObjectId,
    id:number
    nombre:string,
    tipo:string
}
export type familiadb={
    _id?:ObjectId,
    nombre:string,
    integrantes:ObjectId[]
}
export type Dinosaurio={
    _id:string
    id:number,
    nombre:string,
    tipo:string
}
export type familia={
    _id?:string,
    nombre:string,
    integrantes:(Dinosaurio|null)[]
}