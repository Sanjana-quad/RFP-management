import prisma from "../config/db";

export function createVendor(data: any) {
  return prisma.vendor.create({ data });
}

export function listVendors() {
  return prisma.vendor.findMany();
}
