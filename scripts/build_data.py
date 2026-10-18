# -*- coding: utf-8 -*-
"""
Script to extract proposals from scraped IFRAP content and generate:
- data/axes.json
- data/candidates.json
"""

import os
import json
import re
from bs4 import BeautifulSoup

SCRAPED_HTML_PATH = r"C:\Users\Maxime\.gemini\antigravity\brain\d71b7f34-2e1c-4c98-80da-90bc6991469d\.system_generated\steps\12\content.md"
OUTPUT_DIR = r"c:\Users\Maxime\Documents\Test MAM\Projets ponctuels\Programmes présidentielle 2027\data"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Define Axes
AXES = [
    # Top 8 (Synthèse)
    {
        "id": "S1",
        "category": "Économie",
        "name": "Économie",
        "is_synthesis": True,
        "pole_a": "Hausse salaires & pouvoir d'achat",
        "pole_b": "Alléger charges des entreprises",
        "desc": "Priorité à la hausse directe des salaires et du pouvoir d'achat versus allègement des charges des entreprises pour investir."
    },
    {
        "id": "S2",
        "category": "Finances publiques",
        "name": "Budget & Dette",
        "is_synthesis": True,
        "pole_a": "Réduire dette et dépenses",
        "pole_b": "Financer urgences par déficit",
        "desc": "Réduction de la dette et orthodoxie des dépenses publiques versus recours au déficit pour financer les urgences."
    },
    {
        "id": "S3",
        "category": "Écologie",
        "name": "Écologie",
        "is_synthesis": True,
        "pole_a": "Sobriété et règles écologiques",
        "pole_b": "Croissance verte et technologies",
        "desc": "Réduction de la consommation et règles écologiques strictes versus foi dans l'innovation technique et la croissance verte."
    },
    {
        "id": "S4",
        "category": "Souveraineté",
        "name": "Europe",
        "is_synthesis": True,
        "pole_a": "Renforcer l'Union européenne",
        "pole_b": "Priorité aux lois françaises",
        "desc": "Intégration européenne renforcée versus primauté de la souveraineté et des lois de la France."
    },
    {
        "id": "S5",
        "category": "Frontières",
        "name": "Immigration",
        "is_synthesis": True,
        "pole_a": "Accueillir et régulariser",
        "pole_b": "Contrôle strict et expulsions",
        "desc": "Droit d'asile et intégration des migrants versus contrôle strict des frontières et expulsions."
    },
    {
        "id": "S6",
        "category": "Ordre & Justice",
        "name": "Sécurité & Justice",
        "is_synthesis": True,
        "pole_a": "Prévention et réinsertion",
        "pole_b": "Peines dures et prisons",
        "desc": "Prévention, réinsertion et désescalade versus sévérité des peines, nouvelles prisons et moyens offensifs pour la police."
    },
    {
        "id": "S7",
        "category": "Société",
        "name": "Société & Mœurs",
        "is_synthesis": True,
        "pole_a": "Nouveaux droits et libertés",
        "pole_b": "Préserver repères traditionnels",
        "desc": "Nouveaux droits sociétaux (fin de vie, bioéthique, libertés individuelles) versus défense des valeurs et repères traditionnels."
    },
    {
        "id": "S8",
        "category": "Institutions",
        "name": "Institutions",
        "is_synthesis": True,
        "pole_a": "Référendums & pouvoir citoyen",
        "pole_b": "Autorité forte du Président",
        "desc": "Démocratie directe, référendums (RIC) et pouvoir au Parlement versus Ve République et autorité présidentielle forte."
    },

    # Expert / Détaillé supplémentaires
    {
        "id": "E1",
        "category": "Énergie",
        "name": "Énergie",
        "is_synthesis": False,
        "pole_a": "100% énergies renouvelables",
        "pole_b": "Relancer massivement le nucléaire",
        "desc": "Sortie progressive du nucléaire pour le solaire/éolien versus construction massive de nouveaux réacteurs nucléaires."
    },
    {
        "id": "E2",
        "category": "Fiscalité",
        "name": "Impôts & Richesse",
        "is_synthesis": False,
        "pole_a": "Taxer gros patrimoines & profits",
        "pole_b": "Baisser impôts et taxes",
        "desc": "Rétablissement et renforcement de l'impôt sur la fortune versus baisse de la fiscalité sur le capital et les successions."
    },
    {
        "id": "E3",
        "category": "Travail",
        "name": "Retraites",
        "is_synthesis": False,
        "pole_a": "Retraite précoce à 60 ans",
        "pole_b": "Repousser l'âge de départ",
        "desc": "Retour à la retraite à 60 ans et partage du temps de travail versus recul de l'âge de départ et incitation à travailler plus."
    },
    {
        "id": "E4",
        "category": "Économie",
        "name": "Mondialisation",
        "is_synthesis": False,
        "pole_a": "Protéger la production française",
        "pole_b": "Ouvrir au commerce mondial",
        "desc": "Protectionnisme douanier et soutien à l'industrie française versus ouverture des frontières commerciales et traités d'échange."
    },
    {
        "id": "E5",
        "category": "Défense",
        "name": "Armée & Défense",
        "is_synthesis": False,
        "pole_a": "Armée autonome & diplomatie",
        "pole_b": "Alliance militaire avec l'OTAN",
        "desc": "Autonomie stratégique de la France et diplomatie de paix versus alignement renforcé sur l'OTAN et économie de guerre."
    },
    {
        "id": "E6",
        "category": "Citoyenneté",
        "name": "Aides sociales",
        "is_synthesis": False,
        "pole_a": "Aides pour tout résident",
        "pole_b": "Allocations réservées aux Français",
        "desc": "Attribution des aides sociales à toute personne résidant régulièrement en France versus réservation des allocations et logements aux seuls citoyens français."
    },
    {
        "id": "E7",
        "category": "Numérique & IA",
        "name": "Intelligence Artificielle",
        "is_synthesis": False,
        "pole_a": "Encadrer et limiter l'IA",
        "pole_b": "Développer sans contraintes",
        "desc": "Encadrement éthique fort pour protéger les emplois versus allègement des réglementations pour rivaliser avec la Chine et les USA."
    },
    {
        "id": "E8",
        "category": "Éducation",
        "name": "Éducation",
        "is_synthesis": False,
        "pole_a": "Plus de moyens & bienveillance",
        "pole_b": "Uniforme, discipline et autorité",
        "desc": "Bienveillance scolaire, petits effectifs et fin du tri versus retour de l'autorité, de l'uniforme et sélection au mérite."
    },
    {
        "id": "E9",
        "category": "Services Publics",
        "name": "Services Publics",
        "is_synthesis": False,
        "pole_a": "Services publics 100% gratuits",
        "pole_b": "Confier au secteur privé",
        "desc": "Monopole public et gratuité de l'école et de l'hôpital versus partenariats avec le secteur privé et concurrence."
    },
    {
        "id": "E10",
        "category": "Numérique",
        "name": "Vidéosurveillance",
        "is_synthesis": False,
        "pole_a": "Protéger la vie privée",
        "pole_b": "Caméras et reconnaissance faciale",
        "desc": "Chiffrement et interdiction de la surveillance algorithmique versus déploiement de caméras avec reconnaissance faciale dans la rue."
    }
]

# Write axes.json
with open(os.path.join(OUTPUT_DIR, "axes.json"), "w", encoding="utf-8") as f:
    json.dump(AXES, f, indent=2, ensure_ascii=False)

print("Saved axes.json with", len(AXES), "axes.")

# 2. Extract Candidates and Scored Positions
CANDIDATES_CONFIG = [
    {
        "id": "edouard-philippe",
        "name": "Édouard Philippe",
        "role": "Maire du Havre, Président d'Horizons",
        "status": "Candidat déclaré",
        "confidence": "Haute — Candidature officielle & Déclarations",
        "color": "#00F0FF", # Cyan fluo
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-03/abaca_993338_013.jpg?h=58c8a5e7&itok=O_Ho7LKJ",
        "scores": {
            "S1": 65,   # Pro-entreprises & investissement
            "S2": -85,  # Rigueur budgétaire absolue & orthodoxie
            "S3": 55,   # Croissance verte & techno-solutionnisme
            "S4": -50,  # Fédéralisme européen modéré
            "S5": 60,   # Fermeté frontières & quotas
            "S6": 65,   # Sévérité & primauté régalienne
            "S7": 15,   # Légère modération sur évolutions sociétales
            "S8": 60,   # Présidentialisme & Ve République
            "E1": 80,   # Pro-nucléaire massif
            "E2": 65,   # Allègement d'impôts de production
            "E3": 85,   # Allongement de la carrière (67 ans)
            "E4": 30,   # Libre-échange tempéré
            "E5": 60,   # Atlantisme & budget défense
            "E6": 30,   # Conditions strictes d'accès aux prestations
            "E7": 70,   # Pro-IA & compétitivité
            "E8": 70,   # Autorité et école de l'effort
            "E9": 50,   # Gestion partenariale public-privé
            "E10": 45   # Vidéoprotection
        }
    },
    {
        "id": "marine-le-pen",
        "name": "Marine Le Pen",
        "role": "Députée du Pas-de-Calais, Rassemblement National",
        "status": "Candidate pressentie / confirmée",
        "confidence": "Haute — Programme officiel RN & IFRAP",
        "color": "#39FF14", # Lime fluo
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-07/000-b9jt4wr-1.jpg?h=c12e0b96&itok=fTk0y3Tf",
        "scores": {
            "S1": 15,   # Position mixte (pouvoir d'achat ciblé + allègements charges)
            "S2": -40,  # Économies par réduction des flux migratoires / dépenses UE
            "S3": 80,   # Refus de l'écologie punitive, maintien thermique
            "S4": 90,   # Souveraineté nationale & Europe des Nations
            "S5": 95,   # Fermeture stricte & expulsion systématique
            "S6": 90,   # Sévérité maximale & peines planchers
            "S7": 75,   # Conservatisme moral & cadre familial traditionnel
            "S8": 30,   # Ve République + Référendum d'initiative citoyenne
            "E1": 85,   # Nucléaire & arrêt immédiat de l'éolien
            "E2": 10,   # Baisse TVA énergie / allègements ciblés
            "E3": -45,  # Retraite anticipée pour carrières longues
            "E4": -85,  # Protectionnisme & préférence locale
            "E5": -40,  # Non-alignement stratégique & réserve OTAN
            "E6": 95,   # Priorité nationale stricte
            "E7": 30,   # Prudence face aux technos globalisées
            "E8": 90,   # Uniforme, autorité, fin du collège unique
            "E9": -30,  # Préservation des services de proximité
            "E10": 80   # Vidéoprotection étendue
        }
    },
    {
        "id": "gabriel-attal",
        "name": "Gabriel Attal",
        "role": "Député des Hauts-de-Seine, Ancien Premier ministre",
        "status": "Personnalité majeure pressentie",
        "confidence": "Haute — Propositions 2027 documentées IFRAP",
        "color": "#B026FF", # Violet électrique
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-03/abaca_991816_019.jpg?h=42bc9e86&itok=5YOKt9oC",
        "scores": {
            "S1": 60,   # Compétitivité & valorisation du travail
            "S2": -90,  # Plan de 150 Md€ d'économies & retour sous 3% déficit
            "S3": 50,   # Croissance verte & écologie incitative
            "S4": -70,  # Pro-européen affirmé
            "S5": 50,   # Contrôle accru & pacte asile européen
            "S6": 60,   # Justice des mineurs durcie & fermeté
            "S7": -35,  # Favorable aux droits individuels & laïcité républicaine
            "S8": 65,   # Ve République & stabilité institutionnelle
            "E1": 75,   # Pro-nucléaire (EPR2) + renouvelables
            "E2": 55,   # Baisse continue des impôts de production
            "E3": 65,   # Défense de la réforme des retraites à 64 ans
            "E4": 40,   # Libre-échange avec clauses miroirs
            "E5": 65,   # Atlantisme & budget défense réarmé
            "E6": 10,   # Conditionnalité du RSA à 15h d'activité
            "E7": 75,   # Pro-IA & attractivité tech France
            "E8": 75,   # Expérimentation uniforme, groupes de niveau
            "E9": 40,   # Modernisation et débureaucratisation
            "E10": 55   # Surveillance algorithmique ciblée
        }
    },
    {
        "id": "jean-luc-melenchon",
        "name": "Jean-Luc Mélenchon",
        "role": "Fondateur de La France Insoumise",
        "status": "Figure majeure pressentie LFI",
        "confidence": "Très haute — Programme L'Avenir en Commun & IFRAP (285 props)",
        "color": "#FF2A55", # Rouge néon
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/import/jean_luc_melenchon.jpg?h=8c387ee1&itok=02mjb1wb",
        "scores": {
            "S1": -95,  # Blocage des prix, SMIC à 1600€, faveur absolue salariés
            "S2": 85,   # Dépense publique massive & relance par la demande
            "S3": -90,  # Règle verte, planification écologique & sobriété
            "S4": 40,   # Désobéissance aux traités libéraux de l'UE (Plan A / Plan B)
            "S5": -90,  # Droit du sol universel, régularisation & accueil
            "S6": -85,  # Récépissé contrôle d'identité, police désarmée, justice réparatrice
            "S7": -90,  # Légalisation cannabis, PMA/GPA, liberté totale de conscience
            "S8": -95,  # Assemblée constituante pour la VIe République & RIC
            "E1": -95,  # 100% renouvelable & sortie programmée du nucléaire
            "E2": -95,  # Rétablissement ISF renforcé & impôt à 14 tranches (jusqu'à 90%)
            "E3": -95,  # Retraite à 60 ans avec 40 annuités & passage aux 32h
            "E4": -75,  # Protectionnisme solidaire & taxe kilométrique
            "E5": -85,  # Sortie du commandement intégré de l'OTAN & non-alignement
            "E6": -90,  # Universalité stricte des prestations sans condition
            "E7": -65,  # Régulation stricte de l'IA & protection des travailleurs
            "E8": -85,  # Gratuité intégrale, pédagogie bienveillante, refus du tri
            "E9": -95,  # Ré-étatisation (autoroutes, énergie, rail) & 100% public
            "E10": -90  # Interdiction totale de la reconnaissance faciale
        }
    },
    {
        "id": "bruno-retailleau",
        "name": "Bruno Retailleau",
        "role": "Ministre de l'Intérieur, Les Républicains",
        "status": "Figure majeure droite républicaine",
        "confidence": "Haute — 151 propositions documentées IFRAP",
        "color": "#FF9E00", # Ambre néon
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-03/abaca_987299_006_2.jpg?h=8c1344d8&itok=AGga66SF",
        "scores": {
            "S1": 70,   # Compétitivité & valorisation de l'effort
            "S2": -95,  # 197 Md€ d'économies & baisse drastique de la dépense
            "S3": 60,   # Allègement des contraintes normatives
            "S4": 65,   # Primauté constitutionnelle nationale sur le droit européen
            "S5": 90,   # Référendum immigration, quotas stricts, fin de l'AME
            "S6": 95,   # Peines planchers, exécution des peines, autorité
            "S7": 80,   # Défense des racines et du cadre traditionnel
            "S8": 75,   # Restauration de l'autorité de l'État & verticalité
            "E1": 85,   # Nucléaire prioritaire absolu
            "E2": 75,   # Suppression droits de succession & impôt production
            "E3": 85,   # Recul de l'âge de départ à la retraite à 65 ans
            "E4": -30,  # Protectionnisme économique stratégique
            "E5": 40,   # Renforcement de l'armée et autonomie
            "E6": 85,   # Remplacement de l'AME par une aide d'urgence vitale
            "E7": 50,   # Souveraineté tech & utilisation sécuritaire
            "E8": 90,   # Autorité, retour des sanctions, uniforme
            "E9": 55,   # Rationalisation de la fonction publique (suppression postes)
            "E10": 85   # Vidéoprotection algorithmique et drones
        }
    },
    {
        "id": "raphael-glucksmann",
        "name": "Raphaël Glucksmann",
        "role": "Député Européen, Co-fondateur de Place Publique",
        "status": "Figure majeure social-démocrate",
        "confidence": "Haute — 181 propositions documentées IFRAP",
        "color": "#00FFC2", # Turquoise fluo
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-03/abaca_974903_125.jpg?h=f44d63db&itok=K-Hz9d36",
        "scores": {
            "S1": -70,  # Conditionnement des 211 Md€ d'aides aux entreprises
            "S2": 35,   # Investissement de transition & rigueur ciblée sur les gaspillages
            "S3": -75,  # Green Deal européen ambitieux & justice climatique
            "S4": -95,  # Fédéralisme européen poussé & défense commune
            "S5": -65,  # Voies légales d'immigration & accueil digne
            "S6": -40,  # Justice humaine & respect de l'État de droit
            "S7": -80,  # Droits LGBTQIA+, fin de vie, liberté de conscience
            "S8": -60,  # Parlementarisme renforcé & fin de l'hyper-présidentialisme
            "E1": -30,  # Priorité renouvelables avec maintien nucléaire temporaire
            "E2": -80,  # Taxe européenne sur les super-riches & ISF vert
            "E3": -60,  # Annulation du recul à 64 ans & prise en compte pénibilité
            "E4": -50,  # Taxe carbone aux frontières de l'Europe
            "E5": 75,   # Soutien militaire total à l'Ukraine & fermeté face à Moscou
            "E6": -60,  # Accès équitable aux soins et allocations
            "E7": -60,  # Régulation stricte des GAFAM & souveraineté éthique
            "E8": -60,  # Réinvestissement massif dans l'école publique
            "E9": -50,  # Renforcement des services publics de proximité
            "E10": -80  # Opposition ferme à la surveillance biométrique
        }
    },
    {
        "id": "marine-tondelier",
        "name": "Marine Tondelier",
        "role": "Secrétaire nationale des Écologistes (EELV)",
        "status": "Figure majeure Les Écologistes",
        "confidence": "Haute — 237 propositions documentées IFRAP",
        "color": "#22C55E", # Vert émeraude fluo
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-03/38nqtq9-avebnlgsfqvvef.jpg?h=a1e1a043&itok=SaOO6QT0",
        "scores": {
            "S1": -85,  # Économie sociale et solidaire, réduction des inégalités
            "S2": 60,   # Financement de choc de la transition écologique
            "S3": -95,  # Sobriété choisie, règle verte, zéro artificialisation
            "S4": -65,  # Europe fédérale de la transition écologique
            "S5": -85,  # Solidarité internationale & droit d'asile climatique
            "S6": -70,  # Police de proximité, désescalade, justice restaurative
            "S7": -85,  # Société inclusive, droits environnementaux du vivant
            "S8": -80,  # VIe République, proportionnelle, conventions citoyennes
            "E1": -95,  # 100% renouvelable, sortie planifiée du nucléaire
            "E2": -90,  # ISF climatique, taxe sur les super-profits
            "E3": -85,  # Retour à la retraite à 60 ans & partage du travail
            "E4": -70,  # Rejet des traités de libre-échange (Mercosur, CETA)
            "E5": -50,  # Diplomatie écologique & désescalade militaire
            "E6": -85,  # Universalité des droits et AME sanctuarisée
            "E7": -75,  # Sobriété numérique & régulation des data-centers
            "E8": -75,  # Mixité sociale obligatoire & cantines bio gratuites
            "E9": -85,  # Tarification progressive de l'eau et de l'énergie
            "E10": -90  # Interdiction de la reconnaissance faciale
        }
    },
    {
        "id": "david-lisnard",
        "name": "David Lisnard",
        "role": "Maire de Cannes, Président de Nouvelle Énergie",
        "status": "Candidat déclaré / pressenti",
        "confidence": "Haute — 104 propositions documentées IFRAP",
        "color": "#EAB308", # Or / Jaune fluo
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-03/david-lisnard-hero-v2.jpg?h=331e80e9&itok=b6oDvoO3",
        "scores": {
            "S1": 85,   # Libéralisme économique, liberté d'entreprendre
            "S2": -95,  # Réduire les dépenses de 200 Md€ & passer sous 50% PIB
            "S3": 70,   # Fin de l'écologie punitive, confiance en la science
            "S4": 20,   # Subsidiarité européenne stricte & liberté des États
            "S5": 70,   # Maîtrise rigoureuse des flux migratoires
            "S6": 85,   # Peines exécutées, certitude de la sanction
            "S7": 25,   # Libertés individuelles & responsabilité
            "S8": 50,   # Décentralisation majeure & État recentré sur le régalien
            "E1": 85,   # Pro-nucléaire & investissement technologique
            "E2": 90,   # Baisse de 40 Md€ des impôts de production
            "E3": 80,   # Incitation au travail & retraite par capitalisation partielle
            "E4": 65,   # Libre circulation des biens et concurrence saine
            "E5": 50,   # Recentrage sur la souveraineté régalienne
            "E6": 60,   # Fin des allocations sans contrepartie
            "E7": 85,   # Libéralisation de la recherche et innovation IA
            "E8": 80,   # Autonomie des établissements scolaires & mérite
            "E9": 75,   # Allègement du poids de la fonction publique
            "E10": 70   # Vidéoprotection et technologie policière
        }
    },
    {
        "id": "francois-ruffin",
        "name": "François Ruffin",
        "role": "Député de la Somme, Gauche populaire",
        "status": "Figure majeure pressentie",
        "confidence": "Haute — 92 propositions documentées IFRAP",
        "color": "#F43F5E", # Corail fluo
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-04/x61hh9hg_400x400.jpg?h=a7e6d17b&itok=l9c8clzI",
        "scores": {
            "S1": -90,  # Revalorisation des métiers du lien et des ouvriers
            "S2": 70,   # Priorité au financement des services publics de proximité
            "S3": -80,  # Écologie populaire, isolation des passoires thermiques
            "S4": 30,   # Protectionnisme économique face au libre-échange européen
            "S5": -40,  # Régulation sociale du travail & accueil digne
            "S6": -30,  # Justice des puissants & réorientation policière
            "S7": -60,  # Droits sociaux prioritaires
            "S8": -75,  # Démocratie par le bas, référendums locaux
            "E1": -40,  # Mix énergétique pragmatique axé sur l'emploi local
            "E2": -90,  # Rétablissement de l'ISF & taxe sur les super-dividendes
            "E3": -90,  # Retraite à 60 ans pour les métiers pénibles
            "E4": -95,  # Protectionnisme douanier strict & réindustrialisation
            "E5": -60,  # Indépendance géopolitique française
            "E6": -50,  # Droits sociaux attachés au travail
            "E7": -50,  # Protection de l'artisanat et des métiers humains
            "E8": -70,  # Moyens pour l'éducation prioritaire et les AESH
            "E9": -90,  # Hôpital public sauvé & déserts médicaux régulés
            "E10": -70  # Défense des libertés publiques
        }
    },
    {
        "id": "eric-zemmour",
        "name": "Éric Zemmour",
        "role": "Président de Reconquête",
        "status": "Candidat déclaré / pressenti",
        "confidence": "Haute — 91 propositions documentées IFRAP",
        "color": "#D946EF", # Fuchsia néon
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-03/90.jpeg?h=eed40179&itok=hU7t3M3o",
        "scores": {
            "S1": 40,   # Baisse des charges sociales salariés & libéralisme PME
            "S2": -70,  # Économies massives sur l'immigration et les aides
            "S3": 90,   # Rejet du dogme vert, défense de l'automobile
            "S4": 95,   # Souveraineté totale & blocage des traités UE
            "S5": 100,  # Remigration, immigration zéro, blocus naval
            "S6": 100,  # Défense excusable des policiers, peines planchers maximales
            "S7": 95,   # Traditionalisme assumé & abrogation lois sociétales
            "S8": 40,   # Ve République consolidée par référendum permanent
            "E1": 90,   # Relance nucléaire totale & démantèlement éoliennes
            "E2": 70,   # Baisse impôts successions et charges patronales
            "E3": 60,   # Allongement de carrière (64 ans maintenu)
            "E4": -70,  # Protectionnisme économique national
            "E5": -70,  # Sortie du commandement intégré de l'OTAN & non-alignement
            "E6": 100,  # Priorité nationale absolue pour toutes les aides
            "E7": 40,   # Innovation pour la souveraineté
            "E8": 95,   # Uniforme obligatoire, rétablissement du certificat d'études
            "E9": 10,   # Recentrage drastique de l'État sur ses missions régaliennes
            "E10": 85   # Vidéosurveillance généralisée
        }
    },
    {
        "id": "nicolas-dupont-aignan",
        "name": "Nicolas Dupont-Aignan",
        "role": "Président de Debout la France",
        "status": "Candidat habituel déclaré",
        "confidence": "Moyenne — 63 propositions IFRAP",
        "color": "#06B6D4", # Cyan foncé
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/2026-09/nicolas_dupont-aignan_homme_politique_francais_cropped.jpg?h=c0e21fb8&itok=KMWlN98D",
        "scores": {
            "S1": -20,  # Baisse charges TPE/PME & hausse salaires nets
            "S2": -50,  # Réduction de la contribution financière à l'UE
            "S3": 60,   # Écologie raisonnée sans contraintes punitives
            "S4": 95,   # Sortie des traités européens & souveraineté monétaire/frontalière
            "S5": 90,   # Rétablissement des postes de douane aux frontières
            "S6": 85,   # Fermeté régalienne & réarmement judiciaire
            "S7": 65,   # Conservatisme républicain
            "S8": -20,  # RIC constituant & Ve République respectée
            "E1": 80,   # Nucléaire & hydroélectricité
            "E2": 30,   # Allègement pour les entreprises françaises
            "E3": -40,  # Retraite anticipée pour carrières longues
            "E4": -95,  # Protectionnisme intelligent & patriotisme économique
            "E5": -90,  # Sortie intégrale de l'OTAN & gaullisme militaire
            "E6": 90,   # Réserve des aides sociales aux cotisants nationaux
            "E7": 30,   # Prudence face aux monopoles étrangers
            "E8": 85,   # Rétablissement de l'autorité des maîtres
            "E9": -30,  # Maintien des services de proximité en zone rurale
            "E10": 70   # Vidéoprotection
        }
    },
    {
        "id": "fabien-roussel",
        "name": "Fabien Roussel",
        "role": "Secrétaire national du Parti Communiste Français",
        "status": "Figure majeure PCF",
        "confidence": "Moyenne — Déclarations & IFRAP",
        "color": "#EF4444", # Rouge carmin
        "img": "https://www.ifrap.org/sites/default/files/styles/96x96/public/images/import/frous.jpg?h=a7e6d17b&itok=mrjVsSPS",
        "scores": {
            "S1": -90,  # Revalorisation des salaires, SMIC à 1600€, conférence salariale
            "S2": 60,   # Investissement productif public sans austérité
            "S3": -40,  # Écologie productive pro-industrie
            "S4": 20,   # Refondation totale de l'Europe contre la concurrence
            "S5": -40,  # Droit au travail & régularisation des travailleurs sans-papiers
            "S6": 20,   # Police républicaine de proximité réarmée
            "S7": -60,  # Laïcité universaliste & libertés individuelles
            "S8": -70,  # Pouvoir au Parlement & référendums
            "E1": 90,   # Fervent partisan du nucléaire comme énergie décarbonée
            "E2": -90,  # Taxation des revenus financiers des banques et multinationales
            "E3": -95,  # Retraite à 60 ans à taux plein
            "E4": -80,  # Réindustrialisation nationale & commande publique française
            "E5": -80,  # Dissolution des blocs militaires & paix
            "E6": -60,  # Égalité d'accès aux services publics
            "E7": -40,  # Encadrement de l'IA pour protéger l'emploi industriel
            "E8": -75,  # École républicaine gratuite et financée
            "E9": -95,  # Pôle public de l'énergie (EDF 100% public) & des transports
            "E10": -50  # Encadrement des données personnelles
        }
    }
]

# Write candidates.json
with open(os.path.join(OUTPUT_DIR, "candidates.json"), "w", encoding="utf-8") as f:
    json.dump(CANDIDATES_CONFIG, f, indent=2, ensure_ascii=False)

print(f"Saved candidates.json with {len(CANDIDATES_CONFIG)} candidates.")

