﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Moonglade.Configuration;
using Moonglade.Data;
using Moonglade.Data.Entities;
using Moonglade.Data.Infrastructure;
using Moq;
using NUnit.Framework;

namespace Moonglade.Core.Tests;

[TestFixture]
public class SetConfigurationCommandHandlerTests
{
    private MockRepository _mockRepository;
    private Mock<IRepository<BlogConfigurationEntity>> _mockBlogConfigurationRepo;

    [SetUp]
    public void Setup()
    {
        _mockRepository = new(MockBehavior.Default);
        _mockBlogConfigurationRepo = _mockRepository.Create<IRepository<BlogConfigurationEntity>>();
    }

    [Test]
    public async Task Handle_NotFound()
    {
        _mockBlogConfigurationRepo
            .Setup(p => p.GetAsync(It.IsAny<Expression<Func<BlogConfigurationEntity, bool>>>()))
            .Returns(Task.FromResult((BlogConfigurationEntity)null));

        var handler = new SetConfigurationCommandHandler(_mockBlogConfigurationRepo.Object);
        var oc = await handler.Handle(new("Work", "{}"), default);

        Assert.AreEqual(OperationCode.ObjectNotFound, oc);
    }

    [Test]
    public async Task Handle_Updated()
    {
        var entity = new BlogConfigurationEntity();

        _mockBlogConfigurationRepo
            .Setup(p => p.GetAsync(It.IsAny<Expression<Func<BlogConfigurationEntity, bool>>>()))
            .Returns(Task.FromResult(entity));

        var handler = new SetConfigurationCommandHandler(_mockBlogConfigurationRepo.Object);
        var oc = await handler.Handle(new("Work", "{}"), default);

        _mockBlogConfigurationRepo.Verify(p => p.UpdateAsync(It.IsAny<BlogConfigurationEntity>()));
        Assert.AreEqual(OperationCode.Done, oc);
    }
}