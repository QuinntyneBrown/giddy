using System.Security.Cryptography;
using System.Text;
using Giddy.Domain.Parties;

namespace Giddy.Application.Checklist.View;

/// <summary>
/// A short fingerprint of a task as the planner saw it. A change made offline is sent with it, so
/// a change a co-planner made in the meantime is caught instead of overwritten.
/// </summary>
public static class TaskVersion
{
    public static string Of(ChecklistTask task)
    {
        var state = string.Join('|', task.TaskId, task.Title, task.Due, task.Done, task.OwnerId, task.RemindMe);
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(state)))[..12].ToLowerInvariant();
    }
}
