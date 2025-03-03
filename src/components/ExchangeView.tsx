
import { useState } from "react";
import { exchangeOffers, stickers, users } from "@/lib/data";
import { cn } from "@/lib/utils";
import Header from "./Header";
import { Search } from "lucide-react";
import EmptyState from "./EmptyState";

const ExchangeView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Exchange offers
  const myOffers = exchangeOffers;
  
  // Find potential traders (users who have stickers you need)
  const potentialTraders = users.filter(user => 
    user.id !== "currentUser" && user.stickerCount.owned > 0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <Header 
        title="Exchange Platform" 
        subtitle="Swap stickers with other collectors"
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search collectors or stickers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 pl-9 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-interactive focus:border-interactive text-sm transition-all"
            />
          </div>
        }
      />
      
      <div className="space-y-8">
        {/* My Exchange Offers */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Exchange Offers</h2>
          {myOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
              {myOffers.map(offer => (
                <div 
                  key={offer.id} 
                  className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary">
                      <img 
                        src={offer.userAvatar} 
                        alt={offer.userName} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{offer.userName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {getTimeDifference()} ago
                      </p>
                    </div>
                    <div className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                      {offer.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-1 border-r border-border pr-4">
                      <p className="text-xs text-muted-foreground mb-1">They want</p>
                      <p className="font-medium">{offer.wantedStickerName}</p>
                    </div>
                    <div className="flex-1 pl-4">
                      <p className="text-xs text-muted-foreground mb-1">They offer</p>
                      <p className="font-medium">{offer.offeredStickerName}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 py-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors">
                      Accept
                    </button>
                    <button className="flex-1 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="h-12 w-12" />}
              title="No exchange offers"
              description="You don't have any pending exchange offers."
            />
          )}
        </div>
        
        {/* Potential Traders */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Potential Traders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-scale-in">
            {potentialTraders.map(trader => (
              <div 
                key={trader.id} 
                className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary">
                  <img 
                    src={trader.avatar} 
                    alt={trader.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="font-medium">{trader.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="text-xs rounded-full px-2 py-0.5 bg-secondary text-secondary-foreground">
                      {trader.stickerCount.owned} owned
                    </div>
                    <div className="text-xs rounded-full px-2 py-0.5 bg-secondary text-secondary-foreground">
                      {trader.stickerCount.duplicates} duplicates
                    </div>
                  </div>
                </div>
                <button className="ml-auto p-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 6-6-4-6 4" />
                    <path d="M12 2v20" />
                    <path d="m18 18-6 4-6-4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate random time difference for demo purposes
const getTimeDifference = () => {
  const options = ["2 minutes", "15 minutes", "1 hour", "3 hours", "5 hours", "1 day"];
  return options[Math.floor(Math.random() * options.length)];
};

export default ExchangeView;
