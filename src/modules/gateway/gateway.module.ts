import { Module } from "@nestjs/common";
import { RealTimeGateWay } from "./gateway";


@Module({
    providers:[RealTimeGateWay]
})

export class GatewayModule{}