﻿using MediatR;
using Moonglade.Configuration;

namespace Moonglade.Email.Client;

public record MentionNotification(
    string TargetPostTitle,
    string Domain,
    string SourceIp,
    string SourceUrl,
    string SourceTitle) : INotification;

public class MentionNotificationHandler(IMoongladeEmailClient moongladeEmailClient, IBlogConfig blogConfig) : INotificationHandler<MentionNotification>
{
    public async Task Handle(MentionNotification notification, CancellationToken ct) =>
        await moongladeEmailClient.SendEmail(MailMesageTypes.BeingPinged, [blogConfig.GeneralSettings.OwnerEmail], notification);
}