import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { useQuoteWorkspace, useQuoteItems } from "../QuoteWorkspaceProvider";
import type { ProductType } from "../types/quote-workspace.types";

export interface Suggestion {
  id: string;
  type: "missing" | "warning" | "upsell" | "experience";
  icon?: any;
  title: string;
  description: string;
  action?: { label: string; tab: ProductType };
  priority: number; // 1 = high, 3 = low
}

export interface AIAnalysisResult {
  score: number;
  summary: string;
  suggestions: Suggestion[];
  sales_pitch: string;
  email_draft?: string;
}

const fetcher = (url: string, body: any) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((res) => res.json());

export function useQuoteAnalysis() {
  const { state } = useQuoteWorkspace();
  const items = useQuoteItems();
  
  // Debounce the entire quote state to prevent API spam
  const [debouncedQuote] = useDebounce({
    tripName: state.tripName,
    destination: state.destination,
    dates: { start: state.startDate, end: state.endDate },
    travelers: state.travelers,
    items: items.map(i => ({
      type: i.type,
      title: (i as any).name || (i as any).airline || "Item",
      price: i.price,
      details: (i as any).description || (i as any).roomType
    }))
  }, 2000);

  const shouldFetch = debouncedQuote.items.length > 0 || !!debouncedQuote.destination;

  const { data, error, isLoading } = useSWR<AIAnalysisResult>(
    shouldFetch ? ["/api/ai/analyze-quote", debouncedQuote] : null,
    ([url, body]) => fetcher(url, body),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      keepPreviousData: true
    }
  );

  return { analysis: data, isLoading, error };
}
