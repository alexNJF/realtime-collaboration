import { ResizingStatus } from "../enums/resizing-status.enum";

export interface ResizingModel {
    status: ResizingStatus;
    width?: number;
    height?: number
}