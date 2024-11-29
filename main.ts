import{MongoClient, ObjectId}from "mongodb"
import{ApolloServer}from "@apollo/server"
import { startStandaloneServer } from "npm:@apollo/server@4.1/standalone";
import { Dinosaurio, Dinosauriodb, familia, familiadb } from "./types.ts";
import { frommodeltodino, frommodeltofamilia } from "./utilities.ts";

const MONGO_URL=Deno.env.get("MONGO_URL")
if(!MONGO_URL){
  console.error("Mongo url is not set")
  Deno.exit(1)
}
const client=new MongoClient(MONGO_URL)
await client.connect()
const db=client.db("Dinosaurios")
const dinocollection=db.collection<Dinosauriodb>("Dinosaurio")
const familiacollection=db.collection<familiadb>("familia")
const schema=`#graphql

  type Dinosaurio{
    _id:String!
    id:Int!
    nombre:String!
    tipo:String!
  }
  type familia{
    _id:String!,
    nombre:String!,
    integrantes:[Dinosaurio!]!
  }
  type Query{
    getDinosaurios:[Dinosaurio!]!
    getDinosaurio(id:Int!):Dinosaurio
    getfamilia(id:String!):familia
  }
  type Mutation{
    addDinosaurio(id:Int!,name:String!,type:String!):Dinosaurio!
    deleteDinosaurio(id:Int!):String!
  }
`
const resolvers={
  Query:{
    getDinosaurios:async():Promise<Dinosaurio[]>=>{
      const dinosauriosdb=await dinocollection.find().toArray()
      const dinosaurio=dinosauriosdb.map((d)=>frommodeltodino(d))
      return dinosaurio
    },
    getDinosaurio:async(_:unknown,args:{id:number}):Promise<Dinosaurio|string>=>{
      const dinosauriodb=await dinocollection.findOne({id: args.id})
      console.log("busqueda hecha")
      if(!dinosauriodb){
        return "dino no encontrado"
      }
      const dinosaurio=frommodeltodino(dinosauriodb)
      console.log("frommodel to dino hecho")
      return dinosaurio
    },
    getfamilia:async(_:unknown,args:{id:string}):Promise<familia|string>=>{
      const familiadb=await familiacollection.findOne({_id:new ObjectId(args.id)})
      if(!familiadb){
        return "familia no encontrada"
      }
      const familia=frommodeltofamilia(familiadb,dinocollection)
      return familia
    }
  },
  Mutation:{
    addDinosaurio:async(_:unknown,args:{id:number,name:string,type:string}):Promise<Dinosaurio>=>{
     const{insertedId}=await  dinocollection.insertOne({
        id:args.id,
        nombre:args.name,
        tipo:args.type
      })
      return{
        _id:insertedId.toString(),
        id:args.id,
        nombre:args.name,
        tipo:args.type
      }
    }
  }

}
const server= new ApolloServer({
  typeDefs:schema,resolvers
})

const{url}=await startStandaloneServer(server,{listen:{port:8081}})
console.log(url)