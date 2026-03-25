using Xunit;
using Moq;
using RecruitFlow.Core.DTOs.Jobs;
using RecruitFlow.Core.Entities;
using RecruitFlow.Core.Interfaces;
using RecruitFlow.Infrastructure.Services;

namespace RecruitFlow.Tests.Services;

public class JobServiceTests
{
    private readonly Mock<IJobRepository> _jobRepositoryMock;
    private readonly JobService _service;

    public JobServiceTests()
    {
        _jobRepositoryMock = new Mock<IJobRepository>();
        _service = new JobService(_jobRepositoryMock.Object);
    }

    [Fact]
    public async Task GetJobsAsync_ShouldReturnPagedResult()
    {
        // Arrange
        var query = new JobQueryParams { Page = 2, PageSize = 5 };
        var jobs = new List<Job>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Développeur .NET",
                Description = "Backend API",
                Department = "TI",
                Location = "Montréal",
                Status = JobStatus.Published,
                Applications = new List<Application>
                {
                    new(),
                    new()
                }
            }
        };

        _jobRepositoryMock
            .Setup(r => r.GetAllAsync(query, It.IsAny<CancellationToken>()))
            .ReturnsAsync(jobs);

        _jobRepositoryMock
            .Setup(r => r.CountAsync(query, It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.GetJobsAsync(query);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Items);
        Assert.Equal(1, result.TotalCount);
        Assert.Equal(2, result.Page);
        Assert.Equal(5, result.PageSize);
        Assert.Equal("Développeur .NET", result.Items.First().Title);
        Assert.Equal(2, result.Items.First().ApplicationCount);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnDto_WhenJobExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var job = new Job
        {
            Id = id,
            Title = "Architecte .NET",
            Description = "Architecture backend",
            Department = "Architecture",
            Location = "Québec",
            Status = JobStatus.Published,
            CreatedByUser = new User
            {
                FirstName = "Seydi",
                LastName = "Ndiaye"
            }
        };

        _jobRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        // Act
        var result = await _service.GetByIdAsync(id);

        // Assert
        Assert.Equal(id, result.Id);
        Assert.Equal("Architecte .NET", result.Title);
        Assert.Equal("Published", result.Status);
        Assert.Equal("Seydi Ndiaye", result.CreatedByFullName);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrow_WhenJobDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();

        _jobRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Job?)null);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetByIdAsync(id));
        Assert.Contains("introuvable", ex.Message);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreatePublishedJob_WhenPublishImmediatelyIsTrue()
    {
        // Arrange
        var dto = new CreateJobDto
        {
            Title = "Développeur Angular",
            Description = "Frontend Angular",
            Department = "TI",
            Location = "Montréal",
            SalaryMin = 85000,
            SalaryMax = 110000,
            PublishImmediately = true
        };

        var createdByUserId = Guid.NewGuid();
        Job? savedJob = null;

        _jobRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()))
            .Callback<Job, CancellationToken>((job, _) =>
            {
                job.Id = Guid.NewGuid();
                savedJob = job;
            })
            .Returns(Task.CompletedTask);

        _jobRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid id, CancellationToken _) => savedJob!);

        // Act
        var result = await _service.CreateAsync(dto, createdByUserId);

        // Assert
        Assert.NotNull(savedJob);
        Assert.Equal(JobStatus.Published, savedJob!.Status);
        Assert.Equal(createdByUserId, savedJob.CreatedByUserId);
        Assert.Equal(dto.Title, savedJob.Title);
        Assert.Equal("Published", result.Status);

        _jobRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()), Times.Once);
        _jobRepositoryMock.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateDraftJob_WhenPublishImmediatelyIsFalse()
    {
        // Arrange
        var dto = new CreateJobDto
        {
            Title = "QA Analyst",
            Description = "Tests",
            Department = "Qualité",
            Location = "Montréal",
            PublishImmediately = false
        };

        Job? savedJob = null;

        _jobRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Job>(), It.IsAny<CancellationToken>()))
            .Callback<Job, CancellationToken>((job, _) =>
            {
                job.Id = Guid.NewGuid();
                savedJob = job;
            })
            .Returns(Task.CompletedTask);

        _jobRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid id, CancellationToken _) => savedJob!);

        // Act
        var result = await _service.CreateAsync(dto, Guid.NewGuid());

        // Assert
        Assert.NotNull(savedJob);
        Assert.Equal(JobStatus.Draft, savedJob!.Status);
        Assert.Equal("Draft", result.Status);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateOnlyProvidedFields()
    {
        // Arrange
        var id = Guid.NewGuid();
        var job = new Job
        {
            Id = id,
            Title = "Titre initial",
            Description = "Description initiale",
            Department = "TI",
            Location = "Montréal",
            SalaryMin = 60000,
            SalaryMax = 80000,
            Status = JobStatus.Draft
        };

        var dto = new UpdateJobDto
        {
            Title = "Nouveau titre",
            Location = "Québec",
            SalaryMax = 95000
        };

        _jobRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        _jobRepositoryMock
            .Setup(r => r.UpdateAsync(job, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateAsync(id, dto);

        // Assert
        Assert.Equal("Nouveau titre", job.Title);
        Assert.Equal("Description initiale", job.Description);
        Assert.Equal("TI", job.Department);
        Assert.Equal("Québec", job.Location);
        Assert.Equal(60000, job.SalaryMin);
        Assert.Equal(95000, job.SalaryMax);

        Assert.Equal("Nouveau titre", result.Title);
        Assert.Equal("Québec", result.Location);

        _jobRepositoryMock.Verify(r => r.UpdateAsync(job, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrow_WhenJobDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();

        _jobRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Job?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.UpdateAsync(id, new UpdateJobDto()));
    }

    [Fact]
    public async Task DeleteAsync_ShouldCloseJobAndSetClosedAt()
    {
        // Arrange
        var id = Guid.NewGuid();
        var job = new Job
        {
            Id = id,
            Title = "Job à fermer",
            Status = JobStatus.Published
        };

        _jobRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        _jobRepositoryMock
            .Setup(r => r.UpdateAsync(job, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.DeleteAsync(id);

        // Assert
        Assert.Equal(JobStatus.Closed, job.Status);
        Assert.NotNull(job.ClosedAt);

        _jobRepositoryMock.Verify(r => r.UpdateAsync(job, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldUpdateStatusAndClosedAt_WhenClosed()
    {
        // Arrange
        var id = Guid.NewGuid();
        var job = new Job
        {
            Id = id,
            Title = "Job",
            Status = JobStatus.Published
        };

        _jobRepositoryMock
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(job);

        _jobRepositoryMock
            .Setup(r => r.UpdateAsync(job, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateStatusAsync(id, JobStatus.Closed);

        // Assert
        Assert.Equal(JobStatus.Closed, job.Status);
        Assert.NotNull(job.ClosedAt);
        Assert.Equal("Closed", result.Status);
    }

    [Fact]
    public async Task GetPublishedAsync_ShouldReturnPublishedJobsMappedToDtos()
    {
        // Arrange
        var jobs = new List<Job>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Job 1",
                Description = "Desc 1",
                Department = "TI",
                Location = "Montréal",
                Status = JobStatus.Published
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Job 2",
                Description = "Desc 2",
                Department = "RH",
                Location = "Québec",
                Status = JobStatus.Published
            }
        };

        _jobRepositoryMock
            .Setup(r => r.GetPublishedAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(jobs);

        // Act
        var result = (await _service.GetPublishedAsync()).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.All(result, j => Assert.Equal("Published", j.Status));
    }
}