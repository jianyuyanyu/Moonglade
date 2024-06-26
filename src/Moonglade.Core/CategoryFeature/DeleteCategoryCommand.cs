﻿using Edi.CacheAside.InMemory;
using Microsoft.Extensions.Logging;
using Moonglade.Data;

namespace Moonglade.Core.CategoryFeature;

public record DeleteCategoryCommand(Guid Id) : IRequest<OperationCode>;

public class DeleteCategoryCommandHandler(
    MoongladeRepository<CategoryEntity> catRepo,
    ICacheAside cache,
    ILogger<DeleteCategoryCommandHandler> logger)
    : IRequestHandler<DeleteCategoryCommand, OperationCode>
{
    public async Task<OperationCode> Handle(DeleteCategoryCommand request, CancellationToken ct)
    {
        var cat = await catRepo.GetByIdAsync(request.Id, ct);
        if (null == cat) return OperationCode.ObjectNotFound;

        cat.PostCategory.Clear();

        await catRepo.DeleteAsync(cat, ct);
        cache.Remove(BlogCachePartition.General.ToString(), "allcats");

        logger.LogInformation("Category deleted: {Category}", cat.Id);
        return OperationCode.Done;
    }
}