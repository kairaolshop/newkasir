export async function calculateLaba(
  hargaJualSatuan: number,
  hargaBeliSatuan: number = 0,
  jumlah: number,
  marketplaceNama: string
) {
  const res = await fetch(`/api/adminfee?marketplace=${encodeURIComponent(marketplaceNama)}`);
  const adminFees = await res.json(); 

  let totalAdminPerUnit = 0;

  adminFees.forEach((fee: { tipeNominal: string; nominal: number }) => {
    if (fee.tipeNominal === "%") {
      totalAdminPerUnit += hargaJualSatuan * (fee.nominal / 100);
    } else if (fee.tipeNominal === "Rp") {
      totalAdminPerUnit += fee.nominal;
    }
  });

  const labaKotorPerUnit = hargaJualSatuan - hargaBeliSatuan - totalAdminPerUnit;
  const zakatPerUnit = labaKotorPerUnit > 0 ? labaKotorPerUnit * 0.025 : 0;
  const labaBersihPerUnit = labaKotorPerUnit - zakatPerUnit;

  return {
    totalAdmin: Math.round(totalAdminPerUnit * jumlah),
    totalZakat: Math.round(zakatPerUnit * jumlah),
    labaBersih: Math.round(labaBersihPerUnit * jumlah),
  };
}
export function debounce(func: Function, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}