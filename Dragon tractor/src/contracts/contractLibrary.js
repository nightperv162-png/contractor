import { CONFIG } from '../config.js';

export function isLibraryFull(contractLibrary, config = CONFIG) {
  return contractLibrary.length >= config.contracts.maxContractLibrarySize;
}

export function createContractFromTemplate(template, sequenceNumber, config = CONFIG) {
  return {
    ...template,
    id: `${template.id}-${sequenceNumber}`,
    fullContractName: sequenceNumber === config.numbers.firstContractNumber
      ? template.fullContractName
      : `${template.fullContractName} ${sequenceNumber}`,
    callName: sequenceNumber === config.numbers.firstContractNumber
      ? template.callName
      : `${template.callName}${sequenceNumber}`
  };
}

export function saveContractToLibrary(contractLibrary, contract, config = CONFIG) {
  if (isLibraryFull(contractLibrary, config)) {
    return {
      success: false,
      library: contractLibrary,
      reason: config.library.fullSaveReason
    };
  }
  return {
    success: true,
    library: [...contractLibrary, contract],
    reason: config.library.savedReason
  };
}

export function createLoadoutFromLibrary(contractLibrary, config = CONFIG) {
  return config.contracts.slotMarkerLabels.map((markerLabel, index) => {
    const contract = contractLibrary[index] || null;
    return {
      slotId: markerLabel,
      markerLabel,
      contractId: contract?.id || null,
      resolvedCallName: contract?.callName || config.contracts.emptySlotCallName,
      energyCost: contract ? Number.parseInt(contract.cost, config.numbers.decimalRadix) : config.contracts.emptySlotEnergyCost,
      resonanceLabel: config.contracts.resonanceLabels[0],
      stateLabel: config.labels.readyState,
      detailsContract: contract
    };
  });
}
