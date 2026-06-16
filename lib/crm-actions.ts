import {
  Cliente,
  EstadoProyecto,
  EstadoTarea,
  EventoCalendario,
  Proyecto,
  Tarea,
} from "./types";

export type CrmAction =
  | { type: "addCliente"; cliente: Cliente }
  | { type: "updateCliente"; id: string; cliente: Partial<Cliente> }
  | { type: "removeCliente"; id: string }
  | { type: "addProyecto"; proyecto: Proyecto }
  | { type: "updateProyecto"; id: string; proyecto: Partial<Proyecto> }
  | { type: "removeProyecto"; id: string }
  | { type: "moveProyecto"; id: string; estado: EstadoProyecto }
  | { type: "addTarea"; tarea: Tarea }
  | { type: "updateTarea"; id: string; tarea: Partial<Tarea> }
  | { type: "removeTarea"; id: string }
  | { type: "moveTarea"; id: string; estado: EstadoTarea }
  | { type: "addEvento"; evento: EventoCalendario }
  | { type: "updateEvento"; id: string; evento: Partial<EventoCalendario> }
  | { type: "removeEvento"; id: string }
  | { type: "resetDemo" };
