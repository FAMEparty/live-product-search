import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2, ExternalLink } from 'lucide-react';

interface HistoryItem {
  id: string;
  product: {
    title: string;
    price: string;
    image: string;
    url: string;
    asin: string;
  };
  timestamp: number;
  query: string;
}

interface ProductHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onPushLive: (product: any) => void;
}

const ITEMS_PER_PAGE = 20;

export function ProductHistory({ isOpen, onClose, onPushLive }: ProductHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<HistoryItem[]>([]);
  const [loadedCount, setLoadedCount] = useState(ITEMS_PER_PAGE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('product_history');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setHistory(parsed);
          setDisplayedItems(parsed.slice(0, ITEMS_PER_PAGE));
          setLoadedCount(ITEMS_PER_PAGE);
        } catch (e) {
          console.error('Failed to parse history:', e);
          setHistory([]);
        }
      }
    }
  }, [isOpen]);

  // Lazy loading on scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && loadedCount < history.length) {
      const nextCount = Math.min(loadedCount + ITEMS_PER_PAGE, history.length);
      setDisplayedItems(history.slice(0, nextCount));
      setLoadedCount(nextCount);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('product_history');
      setHistory([]);
      setDisplayedItems([]);
    }
  };

  const handlePushLive = (item: HistoryItem) => {
    onPushLive(item.product);
    onClose();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
      <div className="bg-background border-2 border-primary rounded-sm w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/30">
          <div>
            <h2 className="font-['Chakra_Petch'] font-bold text-2xl text-primary">📜 PRODUCT HISTORY</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {history.length} {history.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {displayedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No history yet</p>
              <p className="text-sm mt-2">Products you search will appear here</p>
            </div>
          ) : (
            displayedItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border border-border rounded-sm hover:border-primary/50 transition-colors"
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-sm overflow-hidden">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {item.product.title}
                  </h3>
                  <p className="text-primary font-bold text-lg mb-1">
                    {item.product.price}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Searched: {formatTimestamp(item.timestamp)}
                  </p>
                  {item.query && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Query: "{item.query}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-center">
                  <Button
                    size="sm"
                    onClick={() => handlePushLive(item)}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <ExternalLink className="w-4 h-4" />
                    PUSH LIVE
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(item.product.url, '_blank')}
                    className="gap-2"
                  >
                    View on Amazon
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loadedCount < history.length && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Scroll for more... ({loadedCount} of {history.length})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
