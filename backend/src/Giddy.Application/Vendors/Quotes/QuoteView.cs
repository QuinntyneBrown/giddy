using Giddy.Domain.Vendors;

namespace Giddy.Application.Vendors.Quotes;

/// <param name="ReplyTime">What to expect, for example "Rexy usually replies within a day."</param>
public sealed record QuoteView(Guid Id, Guid VendorId, string VendorName, QuoteStatus Status, string ReplyTime);
