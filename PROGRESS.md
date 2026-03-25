# RecruitFlow — Suivi d'avancement

## Statut global
- Session 1 ✅ | Session 2 ✅ | Session 3 ✅ | Session 4 ⬜

---

## Session 1 — Backend fondations ✅

### Fait
- [ ] Solution ASP.NET Core 8 créée (3 projets)
- [ ] Entités EF Core (User, Job, Application, Interview, Evaluation)
- [ ] AppDbContext + relations Fluent API
- [ ] Migration initiale appliquée sur PostgreSQL
- [ ] Seed data (offres + candidatures + users démo)
- [ ] Auth JWT — Register / Login / Refresh token
- [ ] Middleware erreurs global
- [ ] Swagger configuré avec Bearer auth

### Décisions techniques prises
- (notez ici les choix importants expliqués par Claude)
- Ex: Refresh token stocké en HttpOnly cookie
- Ex: BCrypt pour le hashage des mots de passe

### Fichiers clés
- RecruitFlow.API/Program.cs
- RecruitFlow.Infrastructure/Data/AppDbContext.cs
- RecruitFlow.Core/Entities/
- RecruitFlow.Infrastructure/Seed/DataSeeder.cs
- RecruitFlow.API/Controllers/AuthController.cs

---

## Session 2 — Backend endpoints + Frontend base ✅

### Fait
- [ ] JobsController + JobService + JobRepository
- [ ] ApplicationsController + ApplicationService
- [ ] InterviewsController + InterviewService
- [ ] EvaluationsController + EvaluationService
- [ ] DashboardController (stats agrégées)
- [ ] Projet Angular 19 créé
- [ ] Routing + lazy loading
- [ ] AuthService + JWT interceptor + guards
- [ ] Modèles TypeScript + API services
- [ ] Login / Register components

---

## Session 3 — Frontend features ✅

### Fait
- [ ] Module Offres (liste, CRUD)
- [ ] Module Candidatures + Kanban
- [ ] Module Entretiens + calendrier
- [ ] Module Évaluations + grille scoring
- [ ] Dashboard + Chart.js
- [ ] Layout shell + sidebar navigation
- [ ] Gestion erreurs + loading states

---

## Session 4 — Tests + CI/CD + Déploiement ⏳

### À faire
- [ ] Tests Jest (AuthService, JobService)
- [ ] Tests Cypress (login, CRUD, Kanban)
- [ ] Tests xUnit backend
- [ ] GitHub Actions workflow frontend
- [ ] GitHub Actions workflow backend
- [ ] Déploiement Railway (API + PostgreSQL)
- [ ] Déploiement Firebase Hosting
- [ ] README complet avec screenshots

---

## Variables d'environnement à configurer

### Backend (Railway)
```
DATABASE_URL=
JWT_SECRET=
JWT_ISSUER=
JWT_AUDIENCE=
```

### Frontend (Firebase)
```
API_URL=
```

---

## Liens importants
- Repo GitHub :
- API déployée :
- Frontend déployé :
- Swagger :