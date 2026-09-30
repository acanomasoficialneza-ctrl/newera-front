export interface PriceDto {
    simbolo: string;
    precioActual: number;
    precioCompra: number;
    precioVenta: number;
    variacionPorcentaje: number;
    timestamp: string;
    categoria: string;
}

export interface ApuestaCliente {
    idApuestaCliente?: number;
    tipoCompra: string; // 'COMPRA' o 'VENTA'
    compra: string;     // ej: 'BTC/USD'
    valorUnidad: number;
    montoApuesta: number;
    gananciaPerdida: number;
    estatusCompra: string; // 'ABIERTO', 'CERRADO'
    idUsuario: number;
    categoria?: string;
    unidades?: number;
    variacion?: number;
    bloqueCompra?: string;
    fechaCreacion?: string | Date;
}

export interface UserDashboardDto {
    totalDinero: number;
    margenLibre: number;
    margen: number;
    posicionesAbiertas: ApuestaCliente[];
    preciosMercado: PriceDto[];
}

export interface BalanceDto {
    dineroTotal: number;
    margenLibre: number;
    margen: number;
}

export interface PositionUpdateDto {
    id: number;
    pnl: number;
}
