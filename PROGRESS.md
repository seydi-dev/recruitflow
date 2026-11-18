# RecruitFlow — Suivi d'avancement

## Statut global

| Session | Contenu | Statut |
|---------|---------|--------|
| 1 | Backend, fondations | ✅ |
| 2 | Backend, endpoints + base du frontend | ✅ |
| 3 | Frontend, fonctionnalités | ✅ |
| 4 | Tests, CI/CD, déploiement | ✅ |

---

## Session 1 — Backend fondations ✅

### Fait
- [x] Solution ASP.NET Core 8 créée (3 projets + projet de tests)
- [x] Entités EF Core (User, Job, Application, Interview, Evaluation)
- [x] AppDbContext + relations Fluent API
- [x] Migration initiale appliquée sur PostgreSQL
- [x] Seed data (offres, candidatures, utilisateurs de démonstration)
- [x] Auth JWT — Register / Login / Refresh / Revoke
- [x] Middleware de gestion d'erreurs global
- [x] Swagger configuré avec authentification Bearer

### Décisions techniques
- Mots de passe hachés avec BCrypt
- Access token JWT signé en HS256, durée de 15 minutes, `ClockSkew` à zéro
- Refresh token valide 7 jours, stocké en base sous forme de hash SHA-256 (révocable)
- Fluent API plutôt que Data Annotations pour garder les entités propres
- Mapping manuel des DTO, sans AutoMapper
- Pagination faite dans les repositories (Skip/Take côté SQL)
- Pas de lazy loading : chargement explicite avec `Include`
- Migrations appliquées et seed exécuté au démarrage de l'API
- Origines CORS lues depuis la configuration (`Cors:AllowedOrigins`) pour éviter de recompiler à chaque changement de domaine

### Fichiers clés
- `RecruitFlow.API/Program.cs`
- `RecruitFlow.Infrastructure/AppDbContext.cs`
- `RecruitFlow.Core/Entities/`
- `RecruitFlow.Infrastructure/Seed/DataSeeder.cs`
- `RecruitFlow.API/Controllers/AuthController.cs`
- `RecruitFlow.Infrastructure/Services/AuthService.cs`

---

## Session 2 — Backend endpoints + Frontend base ✅

### Fait
- [x] JobsController + JobService + JobRepository
- [x] ApplicationsController + ApplicationService
- [x] InterviewsController + InterviewService
- [x] EvaluationsController + EvaluationService
- [x] DashboardController (statistiques agrégées)
- [x] Projet Angular 19 créé
- [x] Routing + lazy loading
- [x] AuthService + intercepteur JWT + guards
- [x] Modèles TypeScript + services d'API
- [x] Composants Login / Register

---

## Session 3 — Frontend features ✅

### Fait
- [x] Module Offres (liste, CRUD)
- [x] Module Candidatures + Kanban
- [x] Module Entretiens + calendrier
- [x] Module Évaluations + grille de scoring
- [x] Dashboard + Chart.js
- [x] Layout shell + navigation latérale
- [x] Gestion des erreurs + états de chargement

---

## Session 4 — Tests + CI/CD + Déploiement ✅

### Fait
- [x] Tests Jest (AuthService, JobService)
- [x] Tests Cypress (login, création d'offre, Kanban)
- [x] Tests xUnit backend (JobService, ApplicationService)
- [x] GitHub Actions — workflow frontend (`frontend.yml`) : Jest, build Angular, Cypress avec PostgreSQL
- [x] GitHub Actions — workflow backend (`backend.yml`) : restore, build, xUnit
- [x] Déploiement Railway (API + PostgreSQL)
- [x] Déploiement Firebase Hosting
- [x] README complet

### Reste à faire
- [ ] Captures d'écran dans le README

---

## Configuration

### Backend (variables d'environnement Railway)
```
ConnectionStrings__DefaultConnection=
Jwt__Secret=
Jwt__Issuer=
Jwt__Audience=
Cors__AllowedOrigins__0=
```

### Frontend (Firebase)
L'URL de l'API est définie dans `recruit-flow-front/src/environments/environment.prod.ts` (`apiUrl`).
Le déploiement se fait depuis `recruit-flow-front` après `npm run build`, avec `firebase deploy`.

---

## Liens importants
- Repo GitHub : https://github.com/seydi-dev/recruitflow
- API déployée : https://recruitflow-production.up.railway.app
- Frontend déployé : https://recruit-flow-front.web.app
- Swagger : https://recruitflow-production.up.railway.app/swagger
