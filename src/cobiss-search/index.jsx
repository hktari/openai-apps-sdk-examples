import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Book, Library, CheckCircle, AlertCircle } from "lucide-react";

const mockResponseData = {
  success: true,
  data: {
    found: true,
    query: "Piranesi Susanna Clarke",
    library_id: "siksg",
    total_results: 1,
    books_checked: 1,
    any_available: true,
    books: [
      {
        id: "83264771",
        title: "Piranesi",
        author: "Susanna Clarke",
        details:
          "(znanstveno)fantastična proza | tiskana knjiga  |  slovenski  |  2021",
        cover_url: "https://d.cobiss.net/repository/si/thumbnails/83264771",
        material_type: "(znanstveno)fantastična proza",
        availability: [
          {
            status: "FREE",
            description: "prosto - na dom, čas izposoje: 21 dni",
            inventory_number: "0157147",
            location: "Sg",
            signature_text:
              "Knjižnica Slovenj Gradec oi 82-312.9 CLARKE,S. Piranesi",
            can_reserve: true,
            approx_return_date: null,
            pickup_locations: [
              {
                name: "Knjižnica Slovenj Gradec",
                type: "LIBRARY",
                free_of_charge: true,
              },
              {
                name: "Slovenj Gradec, paketnik Katica",
                type: "PACKAGEBOX",
                free_of_charge: true,
              },
              {
                name: "Slovenj Gradec, paketnik Center",
                type: "PACKAGEBOX",
                free_of_charge: true,
              },
            ],
          },
        ],
        is_available: true,
      },
    ],
  },
  error: null,
};

// OpenAI Apps SDK hooks
const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";

export function useOpenAiGlobal(key) {
  const subscribe = useCallback(
    (onChange) => {
      const handleSetGlobal = (event) => {
        if (event.detail.globals[key] !== undefined) {
          onChange();
        }
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    return window.openai?.[key];
  }, [key]);

  return React.useSyncExternalStore(subscribe, getSnapshot);
}

export function useToolOutput() {
  return useOpenAiGlobal("toolOutput");
}

export function useToolInput() {
  return useOpenAiGlobal("toolInput");
}

export function useTheme() {
  return useOpenAiGlobal("theme");
}

export function useDisplayMode() {
  return useOpenAiGlobal("displayMode");
}

export default function App() {
  // Use the proper OpenAI Apps SDK data access pattern
  const toolOutput = useToolOutput();
  const toolInput = useToolInput();
  const theme = useTheme();

  // Extract search results from tool output (structuredContent from server)
  const searchResults = toolOutput || mockResponseData;
  const { data, error } = searchResults;
  const { books } = data;

  // Handle error state
  if (error) {
    return (
      <div className="antialiased w-full text-black px-4 pb-2 border border-black/10 rounded-2xl sm:rounded-3xl overflow-hidden bg-white">
        <div className="max-w-full">
          <div className="flex flex-row items-center gap-4 sm:gap-4 border-b border-black/5 py-4">
            <div className="sm:w-18 w-16 aspect-square rounded-xl bg-cover bg-center bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-medium">
                COBISS+ Library Search Error
              </div>
              <div className="text-sm text-black/60">
                Unable to fetch search results
              </div>
            </div>
          </div>
          <div className="py-6 text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  const getAvailabilityIcon = (isAvailable) => {
    if (isAvailable) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-orange-500" />;
  };

  const getAvailabilityText = (book) => {
    if (book.is_available) {
      return "Available";
    }
    const availableCount =
      book.availability?.filter((a) => a.status === "FREE").length || 0;
    if (availableCount > 0) {
      return `${availableCount} copies available`;
    }
    return "Currently unavailable";
  };

  // Handle book selection for potential reservation
  const handleBookSelect = async (book) => {
    if (window.openai?.sendFollowUpMessage) {
      await window.openai.sendFollowUpMessage({
        prompt: `I'm interested in "${book.title}" by ${book.author}. Can you help me reserve it or check its availability details?`,
      });
    }
  };

  // Handle export functionality
  const handleExport = async () => {
    if (window.openai?.sendFollowUpMessage) {
      const bookList = books
        .map((book) => `• ${book.title} by ${book.author}`)
        .join("\n");
      await window.openai.sendFollowUpMessage({
        prompt: `Please help me organize these search results:\n${bookList}`,
      });
    }
  };

  // Handle search refinement
  const handleRefineSearch = async () => {
    if (window.openai?.sendFollowUpMessage) {
      await window.openai.sendFollowUpMessage({
        prompt: `I searched for "${toolInput?.title || "books"}" in library ${
          toolInput?.library_id || "the library"
        }. Can you help me refine this search or find similar books?`,
      });
    }
  };

  return (
    <div className="antialiased w-full text-black px-4 pb-2 border border-black/10 rounded-2xl sm:rounded-3xl overflow-hidden bg-white">
      <div className="max-w-full">
        <div className="flex flex-row items-center gap-4 sm:gap-4 border-b border-black/5 py-4">
          <div className="sm:w-18 w-16 aspect-square rounded-xl bg-cover bg-center bg-blue-100 flex items-center justify-center">
            <Library className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <div className="text-base sm:text-xl font-medium">
              COBISS+ Library Search
            </div>
            <div className="text-sm text-black/60">
              Search results from Slovenian library database
            </div>
          </div>
          <div className="flex-auto hidden sm:flex justify-end pr-2">
            <button
              type="button"
              onClick={handleExport}
              className="cursor-pointer inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-1.5 sm:text-md text-sm font-medium hover:opacity-90 active:opacity-100"
            >
              Export Results
            </button>
          </div>
        </div>
        <div className="min-w-full text-sm flex flex-col">
          {books.slice(0, 10).map((book, i) => (
            <div
              key={book.id}
              className="px-3 -mx-2 rounded-2xl hover:bg-black/5 cursor-pointer"
              onClick={() => handleBookSelect(book)}
            >
              <div
                style={{
                  borderBottom:
                    i === Math.min(books.length, 10) - 1
                      ? "none"
                      : "1px solid rgba(0, 0, 0, 0.05)",
                }}
                className="flex w-full items-center hover:border-black/0! gap-2"
              >
                <div className="py-3 pr-3 min-w-0 w-full sm:w-3/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover ring ring-black/5 bg-gray-100 flex items-center justify-center">
                      <Book className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="w-3 text-end sm:block hidden text-sm text-black/40">
                      {i + 1}
                    </div>
                    <div className="min-w-0 sm:pl-1 flex flex-col items-start h-full">
                      <div className="font-medium text-sm sm:text-md truncate max-w-[40ch]">
                        {book.title}
                      </div>
                      <div className="mt-1 sm:mt-0.25 text-black/70 text-sm">
                        {book.author}
                      </div>
                      <div className="mt-1 text-xs text-black/50">
                        {book.details}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block text-end py-2 px-3 text-sm text-black/60 whitespace-nowrap flex-auto">
                  <div className="flex items-center justify-end gap-2">
                    {getAvailabilityIcon(book.is_available)}
                    <span>{getAvailabilityText(book)}</span>
                  </div>
                </div>
                <div className="py-2 whitespace-nowrap flex justify-end">
                  <div className="flex items-center gap-1">
                    {getAvailabilityIcon(book.is_available)}
                    <span className="text-xs text-black/60 sm:hidden">
                      {book.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <div className="py-6 text-center text-black/60">
              No books found matching your search criteria.
            </div>
          )}
        </div>
        <div className="sm:hidden px-0 pt-2 pb-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full cursor-pointer inline-flex items-center justify-center rounded-full bg-blue-600 text-white px-4 py-2 font-medium hover:opacity-90 active:opacity-100"
          >
            Export Results
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("cobiss-search-root")).render(<App />);
