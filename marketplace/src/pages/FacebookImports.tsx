import React from "react";
import { useFacebookImports } from "../hooks/useFacebookImports";
import { FacebookImportsList } from "../components/FacebookImports/FacebookImportsList";
import { FacebookImportsEmpty } from "../components/FacebookImports/FacebookImportsEmpty";
import { FacebookImportsActions } from "../components/FacebookImports/FacebookImportsActions";
import { FacebookImportsDialog } from "../components/FacebookImports/FacebookImportsDialog";

const FacebookImports: React.FC = () => {
  const {
    user,
    listings,
    loading,
    importing,
    parsing,
    selectedIds,
    selectedCount,
    showConfirmModal,
    setShowConfirmModal,
    deleteListing,
    toggleSelection,
    selectAll,
    clearSelection,
    handleFetchFromFacebook,
    handleExtractSelected,
    confirmExtract,
  } = useFacebookImports();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Please log in to view Facebook imports
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (loading || importing || parsing) {
    const status = importing
      ? "Fetching Facebook posts..."
      : parsing
      ? "Extracting listings from posts..."
      : "Loading...";
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold text-gray-900">{status}</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Facebook Imports
            </h1>
            <p className="mt-2 text-gray-600">
              Posts extracted from Facebook ({listings.length} items,{" "}
              {selectedCount} selected)
            </p>
          </div>
          <FacebookImportsActions
            onFetchFromFacebook={handleFetchFromFacebook}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onExtractSelected={handleExtractSelected}
            listingsCount={listings.length}
            selectedCount={selectedCount}
          />
        </div>
        {listings.length === 0 ? (
          <FacebookImportsEmpty onFetchFromFacebook={handleFetchFromFacebook} />
        ) : (
          <FacebookImportsList
            listings={listings}
            selectedIds={selectedIds}
            toggleSelection={toggleSelection}
            deleteListing={deleteListing}
          />
        )}
        <FacebookImportsDialog
          open={showConfirmModal}
          setOpen={setShowConfirmModal}
          selectedCount={selectedCount}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={confirmExtract}
        />
      </div>
    </div>
  );
};

export default FacebookImports;
