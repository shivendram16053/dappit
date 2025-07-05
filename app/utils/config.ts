import { PinataSDK } from "pinata"

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT_ACCESS_TOKEN}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`
})