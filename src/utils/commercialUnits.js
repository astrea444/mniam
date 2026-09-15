const STANDARD_PACKAGES = {
  'makaron': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'makaron spaghetti': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'makaron penne': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'płatki owsiane': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'płatki': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'komosa ryżowa': { size: 400, unit: 'g', commercialUnit: 'opak' },
  'ryż': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'kasza': { size: 400, unit: 'g', commercialUnit: 'opak' },
  'kasza gryczana': { size: 400, unit: 'g', commercialUnit: 'opak' },
  'kasza jaglana': { size: 400, unit: 'g', commercialUnit: 'opak' },
  'mąka': { size: 1000, unit: 'g', commercialUnit: 'opak' },
  'cukier': { size: 1000, unit: 'g', commercialUnit: 'opak' },

  'mleko': { size: 1000, unit: 'ml', commercialUnit: 'opak' },
  'mleko migdałowe': { size: 1000, unit: 'ml', commercialUnit: 'opak' },
  'napój owsiany': { size: 1000, unit: 'ml', commercialUnit: 'opak' },
  'jogurt': { size: 400, unit: 'g', commercialUnit: 'opak' },
  'jogurt naturalny': { size: 400, unit: 'g', commercialUnit: 'opak' },
  'jogurt grecki': { size: 400, unit: 'g', commercialUnit: 'opak' },
  'twaróg': { size: 250, unit: 'g', commercialUnit: 'opak' },
  'masło': { size: 200, unit: 'g', commercialUnit: 'opak' },
  'oliwa z oliwek': { size: 500, unit: 'ml', commercialUnit: 'opak' },
  'oliwa': { size: 500, unit: 'ml', commercialUnit: 'opak' },
  'olej': { size: 1000, unit: 'ml', commercialUnit: 'opak' },

  'orzechy włoskie': { size: 100, unit: 'g', commercialUnit: 'opak' },
  'orzechy': { size: 100, unit: 'g', commercialUnit: 'opak' },
  'migdały': { size: 100, unit: 'g', commercialUnit: 'opak' },
  'jagody': { size: 125, unit: 'g', commercialUnit: 'opak' },
  'borówki': { size: 125, unit: 'g', commercialUnit: 'opak' },
  'maliny': { size: 125, unit: 'g', commercialUnit: 'opak' },

  'filet z łososia': { size: 200, unit: 'g', commercialUnit: 'opak' },
  'łosoś': { size: 200, unit: 'g', commercialUnit: 'opak' },
  'pierś z kurczaka': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'kurczak': { size: 500, unit: 'g', commercialUnit: 'opak' },

  'pomidorki koktajlowe': { size: 250, unit: 'g', commercialUnit: 'opak' },
  'passata': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'sos pomidorowy': { size: 500, unit: 'g', commercialUnit: 'opak' },
  'ciecierzyca': { size: 400, unit: 'g', commercialUnit: 'opak' },
  'fasola': { size: 400, unit: 'g', commercialUnit: 'opak' },

  'jajka': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'jajko': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'awokado': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'banan': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'cytryna': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'jabłko': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'pomidor': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'cebula': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'czosnek': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'cukinia': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'papryka': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'brokuł': { size: 1, unit: 'szt', commercialUnit: 'szt' },
  'ogórek': { size: 1, unit: 'szt', commercialUnit: 'szt' },
}

export function toCommercialUnit(name = '', rawAmount = 1, rawUnit = 'szt', preferredType = null) {
  const cleanName = (name || '').trim().toLowerCase()
  const matchingKey = Object.keys(STANDARD_PACKAGES).find((key) => cleanName.includes(key))
  const standard = matchingKey ? STANDARD_PACKAGES[matchingKey] : null

  const unit = (rawUnit || 'szt').toLowerCase()
  const amount = Number(rawAmount) || 1

  let commercialType = preferredType || (standard ? standard.commercialUnit : (unit === 'g' || unit === 'ml' ? 'opak' : 'szt'))
  let packageSize = standard ? standard.size : 500
  let baseUnit = standard ? standard.unit : unit

  if (commercialType === 'szt') {
    if (unit === 'szt' || unit === 'kromki' || unit === 'łyżki' || unit === 'łyżeczka') {
      const count = Math.max(1, Math.ceil(amount))
      return {
        amount: count,
        unit: 'szt',
        displayUnit: 'szt',
        commercialType: 'szt',
        packageSize: 1,
        rawAmount: amount,
        rawUnit: unit,
        totalStockAmount: count,
        stockUnit: 'szt',
      }
    }

    const count = Math.max(1, Math.ceil(amount / (standard?.size || 150)))
    return {
      amount: count,
      unit: 'szt',
      displayUnit: 'szt',
      commercialType: 'szt',
      packageSize: standard?.size || 150,
      rawAmount: amount,
      rawUnit: unit,
      totalStockAmount: count * (standard?.size || 150),
      stockUnit: unit === 'g' || unit === 'ml' ? unit : 'szt',
    }
  }

  if (unit === 'g') {
    packageSize = standard?.size || (amount <= 100 ? 100 : amount <= 250 ? 250 : 500)
    const packagesCount = Math.max(1, Math.ceil(amount / packageSize))
    const totalWeight = packagesCount * packageSize
    return {
      amount: packagesCount,
      unit: `opak (${packageSize} g)`,
      displayUnit: `opak (${packageSize} g)`,
      commercialType: 'opak',
      packageSize,
      rawAmount: amount,
      rawUnit: 'g',
      totalStockAmount: totalWeight,
      stockUnit: 'g',
    }
  }

  if (unit === 'ml') {
    packageSize = standard?.size || (amount <= 250 ? 250 : amount <= 500 ? 500 : 1000)
    const packagesCount = Math.max(1, Math.ceil(amount / packageSize))
    const totalVolume = packagesCount * packageSize
    return {
      amount: packagesCount,
      unit: `opak (${packageSize} ml)`,
      displayUnit: `opak (${packageSize} ml)`,
      commercialType: 'opak',
      packageSize,
      rawAmount: amount,
      rawUnit: 'ml',
      totalStockAmount: totalVolume,
      stockUnit: 'ml',
    }
  }

  if (unit === 'kg') {
    const packagesCount = Math.max(1, Math.ceil(amount))
    return {
      amount: packagesCount,
      unit: 'opak (1 kg)',
      displayUnit: 'opak (1 kg)',
      commercialType: 'opak',
      packageSize: 1000,
      rawAmount: amount * 1000,
      rawUnit: 'g',
      totalStockAmount: packagesCount * 1000,
      stockUnit: 'g',
    }
  }

  if (unit === 'l') {
    const packagesCount = Math.max(1, Math.ceil(amount))
    return {
      amount: packagesCount,
      unit: 'opak (1 l)',
      displayUnit: 'opak (1 l)',
      commercialType: 'opak',
      packageSize: 1000,
      rawAmount: amount * 1000,
      rawUnit: 'ml',
      totalStockAmount: packagesCount * 1000,
      stockUnit: 'ml',
    }
  }

  const count = Math.max(1, Math.ceil(amount))
  return {
    amount: count,
    unit: 'opak',
    displayUnit: 'opak',
    commercialType: 'opak',
    packageSize: count,
    rawAmount: amount,
    rawUnit: unit,
    totalStockAmount: count,
    stockUnit: 'szt',
  }
}

export function toggleCommercialUnit(item) {
  const currentType = item.commercialType || (item.unit && item.unit.includes('opak') ? 'opak' : 'szt')
  const nextType = currentType === 'opak' ? 'szt' : 'opak'
  const converted = toCommercialUnit(item.name, item.rawAmount || item.amount, item.rawUnit || item.unit, nextType)
  return {
    ...item,
    amount: converted.amount,
    unit: converted.unit,
    displayUnit: converted.displayUnit,
    commercialType: converted.commercialType,
    packageSize: converted.packageSize,
    totalStockAmount: converted.totalStockAmount,
    stockUnit: converted.stockUnit,
  }
}
