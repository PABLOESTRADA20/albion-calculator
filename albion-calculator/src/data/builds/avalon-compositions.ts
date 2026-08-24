import type { AvalonComposition } from "@/lib/avalon/compositions";

/**
 * Composiciones de Roads of Avalon. Las builds referenciadas estan en
 * src/data/avalon/* (sin duplicar items: cada build se define una vez).
 */
export const AVALON_COMPOSITIONS: AvalonComposition[] = [
  // ------------------------------------------------------------- DUO
  {
    id: "duo-bloodletter-holy",
    kind: "duo",
    name: "DPS + Healer",
    style: "Roaming pequeño",
    groupSize: 2,
    difficulty: 2,
    recommendedTier: "T5-T7",
    synergy:
      "El asesino pega y huye mientras el healer mantiene la vida: execute + heals directos es el duo clásico de Roads para cofres y peleas cortas.",
    members: [
      {
        roleLabel: "DPS",
        buildId: "avalon-ar-bloodletter",
        why: "Movilidad alta para entrar y salir de las peleas.",
      },
      {
        roleLabel: "Healer",
        buildId: "avalon-holy",
        why: "Curación directa simple que sigue al asesino sin canalizaciones largas.",
      },
    ],
    scores: { pve: 8, pvp: 9, clearSpeed: 7, survivability: 8 },
  },
  {
    id: "duo-battleaxe-nature",
    kind: "duo",
    name: "Bruiser + Healer",
    style: "PvE sostenido",
    groupSize: 2,
    difficulty: 1,
    recommendedTier: "T4-T6",
    synergy:
      "Sustain doble: el hacha sangra y el druídico cura con HoTs. Cofres verdes en bucle sin morir ni gastar.",
    members: [
      {
        roleLabel: "Bruiser",
        buildId: "avalon-ar-battleaxe",
        why: "Supervivencia por sangrado, aguanta pulls grandes.",
      },
      {
        roleLabel: "Healer",
        buildId: "avalon-druidic-healer",
        why: "HoTs pasivos que no exigen microgestión mientras el bruiser rota.",
      },
    ],
    scores: { pve: 9, pvp: 6, clearSpeed: 8, survivability: 10 },
  },
  {
    id: "duo-carving-arcane",
    kind: "duo",
    name: "DPS + Support",
    style: "PvP presión",
    groupSize: 2,
    difficulty: 2,
    recommendedTier: "T6-T8",
    synergy:
      "El corte sostenido del spam de espadas se mantiene con la energía del enigmático: presión constante sin parar.",
    members: [
      {
        roleLabel: "DPS",
        buildId: "avalon-ar-carving",
        why: "Corte continuo a varios objetivos.",
      },
      {
        roleLabel: "Support",
        buildId: "avalon-support-enigmatic",
        why: "Energía y utilidad para que el DPS nunca pare de presionar.",
      },
    ],
    scores: { pve: 7, pvp: 9, clearSpeed: 6, survivability: 6 },
  },
  {
    id: "duo-shadowcaller-holy",
    kind: "duo",
    name: "DoT + Healer",
    style: "PvE/PvP",
    groupSize: 2,
    difficulty: 2,
    recommendedTier: "T5-T7",
    synergy:
      "Las DoTs del bastón de maldición queman mobs y jugadores mientras el healer saca el burst de salvación.",
    members: [
      {
        roleLabel: "DPS",
        buildId: "avalon-dps-curse",
        why: "DoTs acumulables (familia Shadowcaller/Gran maldición), seguro a distancia.",
      },
      {
        roleLabel: "Healer",
        buildId: "avalon-holy",
        why: "Curación directa para comps de daño lento.",
      },
    ],
    scores: { pve: 8, pvp: 8, clearSpeed: 7, survivability: 8 },
  },

  // ------------------------------------------------------------- TRIO
  {
    id: "trio-standard",
    kind: "trio",
    name: "Trio Standard",
    style: "PvE + PvP",
    groupSize: 3,
    difficulty: 2,
    recommendedTier: "T6-T8",
    synergy:
      "Tank que agrupa, DoTs que queman y heals que sostienen: la comp de contenido de nivel medio más redonda.",
    members: [
      {
        roleLabel: "Tank",
        buildId: "avalon-tank-incubus",
        why: "Silencios y CC para agrupar sin que el grupo reciba daño.",
      },
      {
        roleLabel: "DPS",
        buildId: "avalon-dps-curse",
        why: "Daño sostenido y seguro sobre los packs agrupados.",
      },
      {
        roleLabel: "Healer",
        buildId: "avalon-holy",
        why: "Heals directos para compensar el daño del agrupe.",
      },
    ],
    scores: { pve: 9, pvp: 8, clearSpeed: 8, survivability: 9 },
  },
  {
    id: "trio-melee",
    kind: "trio",
    name: "Trio Melee",
    style: "PvE barato",
    groupSize: 3,
    difficulty: 1,
    recommendedTier: "T4-T6",
    synergy:
      "Toda la comp en melee cuerpo a cuerpo: el martillo stunea, el sable corta y la naturaleza cura. La comp más barata que funciona.",
    members: [
      {
        roleLabel: "Tank",
        buildId: "avalon-tank-mace",
        why: "CC y aguante con el set de guardián.",
      },
      {
        roleLabel: "DPS",
        buildId: "avalon-ar-carving",
        why: "Corte en melee cuando el tank retiene.",
      },
      {
        roleLabel: "Healer",
        buildId: "avalon-druidic-healer",
        why: "HoTs que curan a los tres sin gestión.",
      },
    ],
    scores: { pve: 8, pvp: 7, clearSpeed: 7, survivability: 9 },
  },
  {
    id: "trio-hybrid",
    kind: "trio",
    name: "Trio PvP/PvE",
    style: "Híbrido",
    groupSize: 3,
    difficulty: 3,
    recommendedTier: "T7-T8",
    synergy:
      "Bruiser que aguanta el frente, warbow que pokea y hallowfall que cura en área: lista para PvE y para defender el cofre.",
    members: [
      {
        roleLabel: "Bruiser",
        buildId: "avalon-battleaxe",
        why: "Sustain de vanguardia para peleas y pulls.",
      },
      {
        roleLabel: "DPS",
        buildId: "avalon-dps-warbow",
        why: "Poke y execute a distancia.",
      },
      {
        roleLabel: "Healer",
        buildId: "avalon-hallowfall",
        why: "Curación en área y presencia en PvP.",
      },
    ],
    scores: { pve: 8, pvp: 9, clearSpeed: 7, survivability: 8 },
  },

  // ------------------------------------------------------------- 5-MAN
  {
    id: "fiveman-speed",
    kind: "fiveman",
    name: "PvE Speed Clear",
    style: "Limpieza rápida",
    groupSize: 5,
    difficulty: 2,
    recommendedTier: "T6-T8",
    synergy:
      "Cuatro daños en área y un sustain: los dungs caen antes de que aparezca nadie a molestar.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-incubus", why: "CC para agrupar packs enormes." },
      { roleLabel: "Healer", buildId: "avalon-fallen", why: "Sustained healing para agrupes grandes." },
      { roleLabel: "DPS AoE", buildId: "avalon-dps-frost", why: "Control + daño en área." },
      { roleLabel: "DPS AoE", buildId: "avalon-dps-curse", why: "DoTs sobre todo el pack." },
      { roleLabel: "DPS Melee", buildId: "avalon-dps-pike", why: "Complemento melee del clear." },
    ],
    scores: { pve: 10, pvp: 7, clearSpeed: 10, survivability: 8 },
  },
  {
    id: "fiveman-safe",
    kind: "fiveman",
    name: "PvE Safe",
    style: "Seguro y barato",
    groupSize: 5,
    difficulty: 1,
    recommendedTier: "T4-T6",
    synergy:
      "Todo a distancia y con sustain: la comp para aprender Roads sin perder dinero.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-mace", why: "Aguante básico con set barato." },
      { roleLabel: "Healer", buildId: "avalon-druidic-healer", why: "HoTs para todo el grupo." },
      { roleLabel: "DPS Ranged", buildId: "avalon-dps-longbow", why: "Daño seguro desde lejos." },
      { roleLabel: "DPS Magic", buildId: "avalon-dps-arcane", why: "Debuff + daño de apoyo." },
      { roleLabel: "DPS Melee", buildId: "avalon-dps-halberd", why: "AoE de mercado barato." },
    ],
    scores: { pve: 9, pvp: 6, clearSpeed: 7, survivability: 10 },
  },
  {
    id: "fiveman-gank",
    kind: "fiveman",
    name: "PvP Roaming",
    style: "Gank móvil",
    groupSize: 5,
    difficulty: 3,
    recommendedTier: "T7-T8",
    synergy:
      "Sorpresa y burst: el tank silencia, los dps saltan y el healer disimula. Caza de ratas y defensa de cofres.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-incubus", why: "Silencio para abrir la pelea." },
      { roleLabel: "Healer", buildId: "avalon-hallowfall", why: "Cura en área y aguanta el countergank." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-bearpaws", why: "Burst concentrado sobre el objetivo." },
      { roleLabel: "DPS Ranged", buildId: "avalon-dps-warbow", why: "Poke y remate del execute." },
      { roleLabel: "DPS Assassin", buildId: "avalon-bloodletter", why: "Execute y escape del asesino." },
    ],
    scores: { pve: 6, pvp: 10, clearSpeed: 6, survivability: 7 },
  },
  {
    id: "fiveman-hybrid",
    kind: "fiveman",
    name: "Hybrid",
    style: "PvE + PvP",
    groupSize: 5,
    difficulty: 3,
    recommendedTier: "T6-T8",
    synergy:
      "La comp que farmea y se defiende: control de martillo, shields de blight y purga para los buffs del enemigo.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-hammer", why: "Stuns largos para PvE y PvP." },
      { roleLabel: "Healer", buildId: "avalon-blight", why: "Shields contra el burst enemigo." },
      { roleLabel: "Support", buildId: "avalon-support-malevolent", why: "Purga los buffs del gank." },
      { roleLabel: "DPS Melee", buildId: "avalon-dps-glaive", why: "Daño barato y versátil." },
      { roleLabel: "DPS Magic", buildId: "avalon-dps-frost", why: "Control en área del campo de batalla." },
    ],
    scores: { pve: 8, pvp: 8, clearSpeed: 7, survivability: 8 },
  },
  {
    id: "fiveman-loot",
    kind: "fiveman",
    name: "High Loot",
    style: "Cofres y dungs",
    groupSize: 5,
    difficulty: 2,
    recommendedTier: "T6-T7",
    synergy:
      "Optimizada para generar y proteger loot: daño sostenido que limpia rápido y un tanque flexible que aguanta el contenido de nivel.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-spear", why: "Tank flexible que aporta pierce." },
      { roleLabel: "Healer", buildId: "avalon-wild", why: "Cura y mola con raíces para frenar." },
      { roleLabel: "DPS DoT", buildId: "avalon-dps-curse", why: "Quema cofres y dungs sin cast." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-crossbow", why: "Burst para bosses." },
      { roleLabel: "DPS Bruiser", buildId: "avalon-dps-earthrune", why: "Presencia para proteger el loot." },
    ],
    scores: { pve: 9, pvp: 7, clearSpeed: 8, survivability: 8 },
  },

  // ------------------------------------------------------------- 7-MAN ROAMING
  {
    id: "roam-standard",
    kind: "roaming",
    name: "Standard Roaming",
    style: "Equilibrado",
    groupSize: 7,
    difficulty: 2,
    recommendedTier: "T6-T8",
    synergy:
      "1 tank, 1 healer, 1 support y 4 dps: la estructura estándar que cubre PvE y PvP sin sorpresas.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-incubus", why: "Silencio y agrupe." },
      { roleLabel: "Healer", buildId: "avalon-holy", why: "Heals directos simples." },
      { roleLabel: "Support", buildId: "avalon-support-witchwork", why: "Energía para no parar." },
      { roleLabel: "DPS DoT", buildId: "avalon-dps-curse", why: "Daño seguro." },
      { roleLabel: "DPS Ranged", buildId: "avalon-dps-warbow", why: "Poke y execute." },
      { roleLabel: "DPS AoE", buildId: "avalon-dps-halberd", why: "Clear de packs." },
      { roleLabel: "DPS Melee", buildId: "avalon-dps-pike", why: "Complemento melee." },
    ],
    scores: { pve: 8, pvp: 8, clearSpeed: 8, survivability: 9 },
  },
  {
    id: "roam-pvp",
    kind: "roaming",
    name: "PvP Heavy",
    style: "Caza de ratas",
    groupSize: 7,
    difficulty: 3,
    recommendedTier: "T7-T8",
    synergy:
      "Burst y purga para noquear antes de que lleguen refuerzos: la comp más agresiva de la lista.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-incubus", why: "Abre la pelea con silencios." },
      { roleLabel: "Healer", buildId: "avalon-hallowfall", why: "Cura en área bajo fuego." },
      { roleLabel: "Support", buildId: "avalon-support-malevolent", why: "Purga shields y morfos." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-bearpaws", why: "Golpe de gracia." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-earthrune", why: "Morph presencial." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-hellspawn", why: "Morph agresivo." },
      { roleLabel: "DPS Assassin", buildId: "avalon-bloodletter", why: "Execute y caza." },
    ],
    scores: { pve: 5, pvp: 10, clearSpeed: 5, survivability: 7 },
  },
  {
    id: "roam-pve",
    kind: "roaming",
    name: "PvE Heavy",
    style: "Fame farming",
    groupSize: 7,
    difficulty: 2,
    recommendedTier: "T6-T8",
    synergy:
      "Máxima limpieza: doble AoE mágico, daño sostenido y un gran martillo que agrupa el contenido de nivel.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-greathammer", why: "CC en área para agrupes gigantes." },
      { roleLabel: "Healer", buildId: "avalon-fallen", why: "Sustained para agrupes grandes." },
      { roleLabel: "Support", buildId: "avalon-support-enigmatic", why: "Energía para el spam." },
      { roleLabel: "DPS AoE", buildId: "avalon-dps-frost", why: "Congela packs." },
      { roleLabel: "DPS DoT", buildId: "avalon-dps-curse", why: "Quema todo." },
      { roleLabel: "DPS Ranged", buildId: "avalon-dps-longbow", why: "Rafagas de precisión." },
      { roleLabel: "DPS Melee", buildId: "avalon-dps-pike", why: "Cortes en el melee." },
    ],
    scores: { pve: 10, pvp: 6, clearSpeed: 10, survivability: 8 },
  },
  {
    id: "roam-hybrid",
    kind: "roaming",
    name: "Hybrid",
    style: "PvE + PvP",
    groupSize: 7,
    difficulty: 3,
    recommendedTier: "T6-T8",
    synergy:
      "La comp que farmea toda la sesión y pelea cuando la toca: control de incubus, cura mixta y daño doble.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-incubus", why: "CC universal." },
      { roleLabel: "Healer", buildId: "avalon-wild", why: "Cura y raíces defensivas." },
      { roleLabel: "Support", buildId: "avalon-support-enigmatic", why: "Energía de equipo." },
      { roleLabel: "DPS Melee", buildId: "avalon-dps-glaive", why: "Daño barato." },
      { roleLabel: "DPS Magic", buildId: "avalon-dps-frost", why: "Control del mapa." },
      { roleLabel: "DPS Assassin", buildId: "avalon-bloodletter", why: "Execute en PvP." },
      { roleLabel: "DPS Ranged", buildId: "avalon-dps-warbow", why: "Poke constante." },
    ],
    scores: { pve: 8, pvp: 8, clearSpeed: 7, survivability: 8 },
  },
  {
    id: "roam-mobility",
    kind: "roaming",
    name: "High Mobility",
    style: "Gank móvil",
    groupSize: 7,
    difficulty: 3,
    recommendedTier: "T7-T8",
    synergy:
      "La comp que llega antes que el aviso: todo el mundo con empuje o velocidad para perseguir y rotar.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-spear", why: "Tank móvil con pierce." },
      { roleLabel: "Healer", buildId: "avalon-wild", why: "Healer rápido con control." },
      { roleLabel: "Support", buildId: "avalon-support-witchwork", why: "CD reducidos para rotar skills." },
      { roleLabel: "DPS Assassin", buildId: "avalon-bloodletter", why: "Dash para perseguir." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-bearpaws", why: "Agarre y burst." },
      { roleLabel: "DPS Melee", buildId: "avalon-dps-glaive", why: "Empuje propio." },
      { roleLabel: "DPS Ranged", buildId: "avalon-dps-warbow", why: "Poke desde la rotación." },
    ],
    scores: { pve: 6, pvp: 9, clearSpeed: 6, survivability: 7 },
  },
  {
    id: "roam-antigank",
    kind: "roaming",
    name: "Anti-Gank",
    style: "Defensa",
    groupSize: 7,
    difficulty: 3,
    recommendedTier: "T6-T8",
    synergy:
      "Diseñada para sobrevivir emboscadas: shields, control y daño seguro que disuaden al gank.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-mace", why: "CC defensivo barato." },
      { roleLabel: "Healer", buildId: "avalon-blight", why: "Shields contra el burst inicial." },
      { roleLabel: "Support", buildId: "avalon-support-astral", why: "Escudos en área." },
      { roleLabel: "DPS Magic", buildId: "avalon-dps-arcane", why: "Debuff del atacante." },
      { roleLabel: "DPS Magic", buildId: "avalon-dps-frost", why: "Muros y zonas de control." },
      { roleLabel: "DPS Ranged", buildId: "avalon-dps-longbow", why: "Daño seguro." },
      { roleLabel: "DPS Melee", buildId: "avalon-dps-pike", why: "Corte cerca del healer." },
    ],
    scores: { pve: 7, pvp: 8, clearSpeed: 6, survivability: 10 },
  },
  {
    id: "roam-burst",
    kind: "roaming",
    name: "Burst",
    style: "One-shot",
    groupSize: 7,
    difficulty: 3,
    recommendedTier: "T7-T8",
    synergy:
      "Todos los daños concentrados al mismo objetivo: si la purga acierta, el objetivo cae en un segundo.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-incubus", why: "Silencio para anular la respuesta." },
      { roleLabel: "Healer", buildId: "avalon-holy", why: "Burst de curación para sobrevivir la respuesta." },
      { roleLabel: "Support", buildId: "avalon-support-malevolent", why: "Purga las defensas del objetivo." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-firestaff", why: "Burst mágico de corto alcance." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-bearpaws", why: "Burst melee." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-crossbow", why: "Burst a distancia." },
      { roleLabel: "DPS Burst", buildId: "avalon-dps-hellspawn", why: "Burst de morph." },
    ],
    scores: { pve: 5, pvp: 10, clearSpeed: 5, survivability: 6 },
  },
  {
    id: "roam-sustain",
    kind: "roaming",
    name: "Sustain",
    style: "Guerra de desgaste",
    groupSize: 7,
    difficulty: 2,
    recommendedTier: "T5-T7",
    synergy:
      "Desgaste puro: los sustains de todos se suman y la comp puede pelear sin parar durante minutos.",
    members: [
      { roleLabel: "Tank", buildId: "avalon-tank-incubus", why: "CC para frustrar al enemigo." },
      { roleLabel: "Healer", buildId: "avalon-druidic-healer", why: "HoTs infinitos." },
      { roleLabel: "Support", buildId: "avalon-support-witchwork", why: "Energía para el sustain." },
      { roleLabel: "DPS Sustain", buildId: "avalon-dps-rampant", why: "Sustain mágico en el trade." },
      { roleLabel: "Bruiser", buildId: "avalon-battleaxe", why: "Sangrado de guerra larga." },
      { roleLabel: "DPS Bruiser", buildId: "avalon-dps-earthrune", why: "Morph que no muere." },
      { roleLabel: "DPS DoT", buildId: "avalon-dps-curse", why: "Quema prolongada." },
    ],
    scores: { pve: 8, pvp: 8, clearSpeed: 7, survivability: 10 },
  },
];