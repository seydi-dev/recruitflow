using Xunit;
using Moq;
using RecruitFlow.Core.DTOs.Applications;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;
using RecruitFlow.Infrastructure.Services;

namespace RecruitFlow.Tests.Services;

public class ApplicationServiceTests
{
    private readonly Mock<IApplicationRepository> _applicationRepositoryMock;
    private readonly Mock<IJobRepository> _jobRepositoryMock;
    private readonly ApplicationService _service;

    public ApplicationServiceTests()
    {
        _applicationRepositoryMock = new Mock<IApplicationRepository>();
        _jobRepositoryMock = new Mock<IJobRepository>();
        _service = new ApplicationService(_applicationRepositoryMock.Object, _jobRepositoryMock.Object);
    }

    [Fact]
    public async Task GetApplicationsAsync_ShouldReturnPagedResult()
    {
        // Arrange
        var query = new ApplicationQueryParams { Page = 1, PageSize = 10 };
        var applications = new List<Application>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Status = ApplicationStatus.Pending,
                JobId = Guid.NewGuid(),
                CandidateId = Guid.NewGuid(),
                Job = new Job { Title = "Développeur .NET" },
                Candidate = new User
                {
                    FirstName = "Alice",
                    LastName = "Tremblay",
                    Email = "alice@example.com"
                },
                Interviews = new List<Interview> { new(), new() }
            }
        };

        _applicationRepositoryMock
            .Setup(r => r.GetAllAsync(query, It.IsAny<CancellationToken>()))
            .ReturnsAsync(applications);

        _applicationRepositoryMock
            .Setup(r => r.CountAsync(query, It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.GetApplicationsAsync(query);

        // Assert
        Assert.Single(result.Items);
        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Pending", result.Items.First().Status);
        Assert.Equal("Développeur .NET", result.Items.First().JobTitle);
        Assert.Equal("Alice Tremblay", result.Items.First().CandidateFullName);
        Assert.Equal(2, result.Items.First().InterviewCount);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnDto_WhenApplicationExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var app = new Application
        {
            Id = id,
            Status = ApplicationStatus.Interview,
            JobId = Guid.NewGuid(),
            CandidateId = Guid.NewGuid(),
            Job = new Job { Title = "Développeur Angular" },
            Candidate = new User
            {
                FirstName = "Marc",
                LastName = "Gagnon",
                Email = "marc@example.com"
            }
        };

        _applicationRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _service.GetByIdAsync(id);

        // Assert
        Assert.Equal(id, result.Id);
        Assert.Equal("Interview", result.Status);
        Assert.Equal("Développeur Angular", result.JobTitle);
        Assert.Equal("Marc Gagnon", result.CandidateFullName);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrow_WhenApplicationDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();

        _applicationRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Application?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetByIdAsync(id));
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateApplication_WhenJobExistsAndCandidateHasNotApplied()
    {
        // Arrange
        var dto = new CreateApplicationDto
        {
            JobId = Guid.NewGuid(),
            CoverLetter = "Lettre de motivation",
            ResumeUrl = "https://example.com/cv.pdf"
        };
        var candidateId = Guid.NewGuid();
        Application? savedApplication = null;

        _jobRepositoryMock
            .Setup(r => r.ExistsAsync(dto.JobId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _applicationRepositoryMock
            .Setup(r => r.ExistsAsync(dto.JobId, candidateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _applicationRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Application>(), It.IsAny<CancellationToken>()))
            .Callback<Application, CancellationToken>((application, _) =>
            {
                application.Id = Guid.NewGuid();
                savedApplication = application;
            })
            .Returns(Task.CompletedTask);

        _applicationRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid id, CancellationToken _) => savedApplication!);

        // Act
        var result = await _service.CreateAsync(dto, candidateId);

        // Assert
        Assert.NotNull(savedApplication);
        Assert.Equal(dto.JobId, savedApplication!.JobId);
        Assert.Equal(candidateId, savedApplication.CandidateId);
        Assert.Equal(ApplicationStatus.Pending, savedApplication.Status);
        Assert.Equal("Pending", result.Status);

        _applicationRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Application>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenJobDoesNotExist()
    {
        // Arrange
        var dto = new CreateApplicationDto { JobId = Guid.NewGuid() };
        var candidateId = Guid.NewGuid();

        _jobRepositoryMock
            .Setup(r => r.ExistsAsync(dto.JobId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(dto, candidateId));
        Assert.Contains("introuvable", ex.Message);

        _applicationRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Application>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenCandidateAlreadyApplied()
    {
        // Arrange
        var dto = new CreateApplicationDto { JobId = Guid.NewGuid() };
        var candidateId = Guid.NewGuid();

        _jobRepositoryMock
            .Setup(r => r.ExistsAsync(dto.JobId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _applicationRepositoryMock
            .Setup(r => r.ExistsAsync(dto.JobId, candidateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto, candidateId));
        Assert.Contains("déjà postulé", ex.Message);

        _applicationRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Application>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldUpdateStatus_WhenApplicationExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var app = new Application
        {
            Id = id,
            Status = ApplicationStatus.Pending
        };

        _applicationRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _applicationRepositoryMock
            .Setup(r => r.UpdateAsync(app, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateStatusAsync(id, ApplicationStatus.Offer);

        // Assert
        Assert.Equal(ApplicationStatus.Offer, app.Status);
        Assert.Equal("Offer", result.Status);

        _applicationRepositoryMock.Verify(r => r.UpdateAsync(app, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldThrow_WhenApplicationDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();

        _applicationRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Application?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateStatusAsync(id, ApplicationStatus.Rejected));
    }

    [Fact]
    public async Task WithdrawAsync_ShouldSetStatusToWithdrawn_WhenCandidateOwnsApplication()
    {
        // Arrange
        var id = Guid.NewGuid();
        var candidateId = Guid.NewGuid();

        var app = new Application
        {
            Id = id,
            CandidateId = candidateId,
            Status = ApplicationStatus.Pending
        };

        _applicationRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _applicationRepositoryMock
            .Setup(r => r.UpdateAsync(app, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.WithdrawAsync(id, candidateId);

        // Assert
        Assert.Equal(ApplicationStatus.Withdrawn, app.Status);
        _applicationRepositoryMock.Verify(r => r.UpdateAsync(app, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task WithdrawAsync_ShouldThrow_WhenCandidateDoesNotOwnApplication()
    {
        // Arrange
        var id = Guid.NewGuid();
        var realCandidateId = Guid.NewGuid();
        var anotherCandidateId = Guid.NewGuid();

        var app = new Application
        {
            Id = id,
            CandidateId = realCandidateId,
            Status = ApplicationStatus.Pending
        };

        _applicationRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.WithdrawAsync(id, anotherCandidateId));
        Assert.Contains("retirer", ex.Message);

        _applicationRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Application>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}