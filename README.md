RecruitFlow

Modern Recruitment Management Platform

RecruitFlow est une plateforme complète de gestion du recrutement permettant aux entreprises de publier des offres, suivre les candidatures et gérer leur pipeline de recrutement via une interface kanban interactive.

Le projet met en œuvre une architecture moderne full-stack, des tests automatisés et un pipeline CI/CD, reflétant des pratiques professionnelles utilisées en entreprise.

Aperçu

RecruitFlow permet de :

publier et gérer des offres d’emploi
suivre les candidatures dans un pipeline visuel
organiser les entrevues
analyser les données de recrutement via un dashboard
automatiser la qualité du code avec tests et CI/CD
Stack technologique
Frontend
Angular 19
Angular Material
RxJS
SCSS

Tests :

Jest (unit tests)
Cypress (end-to-end tests)
Backend
ASP.NET Core 8
Entity Framework Core
PostgreSQL
JWT Authentication
Swagger API documentation

Tests :

xUnit
Moq
CI/CD

GitHub Actions :

Frontend pipeline

installation dépendances
tests unitaires (Jest)
build Angular
tests E2E (Cypress)

Backend pipeline

restore
build
tests unitaires (xUnit)
Architecture

Le backend suit une séparation claire des responsabilités inspirée de Clean Architecture.

Controller
   ↓
Service (Business Logic)
   ↓
Repository (Data Access)
   ↓
Database (PostgreSQL)

Structure du projet :

RecruitFlow
│
├── recruit-flow-front        Angular application
│
├── RecruitFlow.API           ASP.NET Core API
│
├── RecruitFlow.Core          Domain entities + interfaces
│
├── RecruitFlow.Infrastructure
│       ├── repositories
│       ├── services
│       └── database
│
└── RecruitFlow.Tests         Backend unit tests
Fonctionnalités principales
Authentification
JWT authentication
login / register
gestion des rôles
Gestion des offres

Création et gestion des offres d’emploi :

titre
description
département
localisation
salaire min / max
statut (Draft / Published / Closed)
Pipeline de recrutement

Chaque candidature évolue dans un pipeline :

Pending
Reviewing
Interview
Offer
Rejected
Withdrawn

Les recruteurs peuvent déplacer les candidatures via une interface kanban drag & drop.

Gestion des candidatures

Fonctionnalités :

soumission candidature
suivi statut
retrait candidature
gestion des entrevues
Dashboard

Visualisation des données :

nombre d’offres actives
candidatures
entrevues
progression pipeline
Qualité logicielle

RecruitFlow inclut plusieurs niveaux de tests.

Frontend

Unit tests

npm run test

Technologie :

Jest
End-to-End
npx cypress run

Tests simulant un utilisateur réel :

login
création offre
déplacement candidature dans le kanban
Backend
dotnet test RecruitFlow.Tests

Tests unitaires couvrant :

logique métier des services
validation des règles métier
gestion des erreurs

Frameworks :

xUnit
Moq
Installation locale
Cloner le projet
git clone https://github.com/USERNAME/recruitflow.git
cd recruitflow
Backend
cd RecruitFlow.API
dotnet restore
dotnet ef database update
dotnet run

API :

http://localhost:5072

Swagger :

http://localhost:5072/swagger
Frontend
cd recruit-flow-front
npm install
npm start

Application :

http://localhost:4200
Exemple de pipeline CI

Chaque push déclenche automatiquement :

Frontend

install
tests Jest
build Angular
tests Cypress

Backend

restore
build
tests xUnit
Sécurité
JWT authentication
validation backend
séparation des responsabilités
protection des endpoints
Améliorations futures
notifications temps réel
tri intelligent des candidatures
intégration email
analytics avancées
application mobile
Auteur

Seydi Ahmeth Ndiaye
Étudiant en informatique – UQTR

Technologies principales :

Angular
ASP.NET Core
PostgreSQL
Licence

Projet éducatif / portfolio
