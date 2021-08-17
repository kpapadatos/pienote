import { Injectable } from '@angular/core';
import { equal, Fraction, fraction } from 'mathjs';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ChartsService {
    private trackId!: string;
    private charts$ = new BehaviorSubject<IChart[]>([]);
    private chart$ = new BehaviorSubject<IChart | undefined>(undefined);
    public setTrackId(trackId: string) {
        this.trackId = trackId;
        this.loadCharts();
    }
    public upsertNote(note: INote) {
        this.getBeat(note.beatIndex).push(note);
        this.saveCharts();
    }
    public removeNote(note: INote) {
        const existingNote = this.findNote(note);

        if (existingNote) {
            const beat = this.getBeat(note.beatIndex);
            beat.splice(beat.indexOf(existingNote), 1);
        }

        this.saveCharts();
    }
    public findNote(note: INote) {
        const beat = this.getBeat(note.beatIndex);
        return beat.find(o =>
            this.isTimeEqual(o, note) &&
            o.noteId === note.noteId
        );
    }
    public isTimeEqual(a: { divisions: number; lineIndex: number }, b: { divisions: number; lineIndex: number }) {
        return equal(
            this.getLineTime(a.divisions, a.lineIndex),
            this.getLineTime(b.divisions, b.lineIndex)
        );
    }
    public getLineTime(divisions: number, lineIndex: number) {
        return fraction(lineIndex, divisions) as Fraction;
    }
    public getBeat(beatIndex: number) {
        const chart = this.getChart();

        if (!chart.notes[beatIndex]) {
            chart.notes[beatIndex] = [];
        }

        return chart.notes[beatIndex];
    }
    private saveCharts() {
        localStorage.setItem(this.getChartKey(), JSON.stringify(this.charts$.getValue()));
    }
    private getChart() {
        return this.chart$.getValue() as IChart;
    }
    private loadCharts() {
        const charts = this.getChartsFromStorage();
        this.charts$.next(charts);
        this.chart$.next(charts[0]);
    }
    private getChartsFromStorage() {
        const chartJson = localStorage.getItem(this.getChartKey());

        if (this.trackId === '2DlHlPMa4M17kufBvI2lEN') {
            // @todo Remove
            return [
                {
                    kind: 'drums',
                    notes: [null, [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [{ beatIndex: 19, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 19, noteId: 'hihat', divisions: 4, lineIndex: 4 }], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [{ beatIndex: 35, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 35, noteId: 'tom', divisions: 4, lineIndex: 4 }, { beatIndex: 35, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 35, noteId: 'lowtom', divisions: 4, lineIndex: 4 }], [{ beatIndex: 36, noteId: 'tom', divisions: 4, lineIndex: 4 }, { beatIndex: 36, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 36, noteId: 'hightom', divisions: 4, lineIndex: 3 }, { beatIndex: 36, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 36, noteId: 'lowtom', divisions: 4, lineIndex: 4 }], [{ beatIndex: 37, noteId: 'tom', divisions: 4, lineIndex: 1 }, { beatIndex: 37, noteId: 'tom', divisions: 4, lineIndex: 2 }, { beatIndex: 37, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 37, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 37, noteId: 'lowtom', divisions: 4, lineIndex: 1 }, { beatIndex: 37, noteId: 'lowtom', divisions: 4, lineIndex: 2 }], [{ beatIndex: 38, noteId: 'tom', divisions: 4, lineIndex: 2 }, { beatIndex: 38, noteId: 'tom', divisions: 4, lineIndex: 3 }, { beatIndex: 38, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 38, noteId: 'hightom', divisions: 4, lineIndex: 1 }, { beatIndex: 38, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 38, noteId: 'lowtom', divisions: 4, lineIndex: 3 }, { beatIndex: 38, noteId: 'crash', divisions: 4, lineIndex: 4 }], [{ beatIndex: 39, noteId: 'crash', divisions: 4, lineIndex: 2 }, { beatIndex: 39, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 39, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 39, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 40, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 40, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 40, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 40, noteId: 'hightom', divisions: 4, lineIndex: 3 }], [{ beatIndex: 41, noteId: 'lowtom', divisions: 4, lineIndex: 1 }, { beatIndex: 41, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 41, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 41, noteId: 'hightom', divisions: 4, lineIndex: 4 }], [{ beatIndex: 42, noteId: 'hightom', divisions: 4, lineIndex: 1 }, { beatIndex: 42, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 42, noteId: 'lowtom', divisions: 4, lineIndex: 3 }, { beatIndex: 42, noteId: 'crash', divisions: 4, lineIndex: 4 }, { beatIndex: 42, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 43, noteId: 'crash', divisions: 4, lineIndex: 2 }, { beatIndex: 43, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 43, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 43, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 44, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 44, noteId: 'hightom', divisions: 4, lineIndex: 3 }, { beatIndex: 44, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 44, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 45, noteId: 'lowtom', divisions: 4, lineIndex: 1 }, { beatIndex: 45, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 45, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 45, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 46, noteId: 'hightom', divisions: 4, lineIndex: 1 }, { beatIndex: 46, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 46, noteId: 'lowtom', divisions: 4, lineIndex: 3 }, { beatIndex: 46, noteId: 'crash', divisions: 4, lineIndex: 4 }, { beatIndex: 46, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 47, noteId: 'crash', divisions: 4, lineIndex: 2 }, { beatIndex: 47, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 47, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 47, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 48, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 48, noteId: 'hightom', divisions: 4, lineIndex: 3 }, { beatIndex: 48, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 48, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 49, noteId: 'lowtom', divisions: 4, lineIndex: 1 }, { beatIndex: 49, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 49, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 49, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 50, noteId: 'hightom', divisions: 4, lineIndex: 1 }, { beatIndex: 50, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 50, noteId: 'lowtom', divisions: 4, lineIndex: 3 }, { beatIndex: 50, noteId: 'crash', divisions: 4, lineIndex: 4 }, { beatIndex: 50, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 51, noteId: 'crash', divisions: 4, lineIndex: 2 }, { beatIndex: 51, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 51, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 51, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 52, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 52, noteId: 'hightom', divisions: 4, lineIndex: 3 }, { beatIndex: 52, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 52, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 53, noteId: 'lowtom', divisions: 4, lineIndex: 1 }, { beatIndex: 53, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 53, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 53, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 54, noteId: 'hightom', divisions: 4, lineIndex: 1 }, { beatIndex: 54, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 54, noteId: 'lowtom', divisions: 4, lineIndex: 3 }, { beatIndex: 54, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 54, noteId: 'crash', divisions: 4, lineIndex: 4 }], [{ beatIndex: 55, noteId: 'crash', divisions: 4, lineIndex: 2 }, { beatIndex: 55, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 55, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 55, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 56, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 56, noteId: 'hightom', divisions: 4, lineIndex: 3 }, { beatIndex: 56, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 56, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 57, noteId: 'lowtom', divisions: 4, lineIndex: 1 }, { beatIndex: 57, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 57, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 57, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 58, noteId: 'hightom', divisions: 4, lineIndex: 1 }, { beatIndex: 58, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 58, noteId: 'lowtom', divisions: 4, lineIndex: 3 }, { beatIndex: 58, noteId: 'crash', divisions: 4, lineIndex: 4 }, { beatIndex: 58, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 59, noteId: 'crash', divisions: 4, lineIndex: 2 }, { beatIndex: 59, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 59, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 59, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 60, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 60, noteId: 'hightom', divisions: 4, lineIndex: 3 }, { beatIndex: 60, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 60, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 61, noteId: 'lowtom', divisions: 4, lineIndex: 1 }, { beatIndex: 61, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 61, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 61, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 62, noteId: 'hightom', divisions: 4, lineIndex: 1 }, { beatIndex: 62, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 62, noteId: 'lowtom', divisions: 4, lineIndex: 3 }, { beatIndex: 62, noteId: 'crash', divisions: 4, lineIndex: 4 }, { beatIndex: 62, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 63, noteId: 'crash', divisions: 4, lineIndex: 2 }, { beatIndex: 63, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 63, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 63, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 64, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 64, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 64, noteId: 'kick', divisions: 4, lineIndex: 2 }, { beatIndex: 64, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 64, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 64, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 65, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 65, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 65, noteId: 'kick', divisions: 4, lineIndex: 2 }, { beatIndex: 65, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 65, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 65, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 66, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 66, noteId: 'hightom', divisions: 4, lineIndex: 2 }, { beatIndex: 66, noteId: 'kick', divisions: 4, lineIndex: 2 }, { beatIndex: 66, noteId: 'lowtom', divisions: 4, lineIndex: 4 }, { beatIndex: 66, noteId: 'hightom', divisions: 4, lineIndex: 4 }, { beatIndex: 66, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 67, noteId: 'lowtom', divisions: 4, lineIndex: 2 }, { beatIndex: 67, noteId: 'kick', divisions: 4, lineIndex: 2 }, { beatIndex: 67, noteId: 'crash', divisions: 4, lineIndex: 4 }, { beatIndex: 67, noteId: 'kick', divisions: 4, lineIndex: 4 }, { beatIndex: 67, noteId: 'snare', divisions: 4, lineIndex: 2 }], [{ beatIndex: 68, noteId: 'hihat', divisions: 4, lineIndex: 2 }, { beatIndex: 68, noteId: 'kick', divisions: 4, lineIndex: 3 }, { beatIndex: 68, noteId: 'snare', divisions: 4, lineIndex: 4 }, { beatIndex: 68, noteId: 'hihat', divisions: 4, lineIndex: 4 }], [{ beatIndex: 69, noteId: 'hihat', divisions: 4, lineIndex: 2 }, { beatIndex: 69, noteId: 'snare', divisions: 4, lineIndex: 3 }, { beatIndex: 69, noteId: 'hihat', divisions: 4, lineIndex: 4 }, { beatIndex: 69, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 70, noteId: 'hihat', divisions: 4, lineIndex: 2 }, { beatIndex: 70, noteId: 'kick', divisions: 4, lineIndex: 3 }, { beatIndex: 70, noteId: 'snare', divisions: 4, lineIndex: 4 }, { beatIndex: 70, noteId: 'hihat', divisions: 4, lineIndex: 4 }], [{ beatIndex: 71, noteId: 'hihat', divisions: 4, lineIndex: 2 }, { beatIndex: 71, noteId: 'snare', divisions: 4, lineIndex: 3 }, { beatIndex: 71, noteId: 'hihat', divisions: 4, lineIndex: 4 }, { beatIndex: 71, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 72, noteId: 'hihat', divisions: 4, lineIndex: 2 }, { beatIndex: 72, noteId: 'hihat', divisions: 4, lineIndex: 4 }, { beatIndex: 72, noteId: 'snare', divisions: 4, lineIndex: 4 }, { beatIndex: 72, noteId: 'kick', divisions: 4, lineIndex: 3 }], [{ beatIndex: 73, noteId: 'hihat', divisions: 4, lineIndex: 2 }, { beatIndex: 73, noteId: 'snare', divisions: 4, lineIndex: 3 }, { beatIndex: 73, noteId: 'hihat', divisions: 4, lineIndex: 4 }, { beatIndex: 73, noteId: 'kick', divisions: 4, lineIndex: 4 }], [{ beatIndex: 74, noteId: 'hihat', divisions: 4, lineIndex: 2 }, { beatIndex: 74, noteId: 'kick', divisions: 4, lineIndex: 2 }, { beatIndex: 74, noteId: 'snare', divisions: 4, lineIndex: 4 }, { beatIndex: 74, noteId: 'crash', divisions: 4, lineIndex: 4 }], [{ beatIndex: 75, noteId: 'hihat', divisions: 4, lineIndex: 2 }, { beatIndex: 75, noteId: 'snare', divisions: 4, lineIndex: 3 }, { beatIndex: 75, noteId: 'crash', divisions: 4, lineIndex: 4 }, { beatIndex: 75, noteId: 'kick', divisions: 4, lineIndex: 4 }], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
                }
            ] as any;
        }

        if (chartJson) {
            return JSON.parse(chartJson) as IChart[];
        } else {
            return [{ kind: ChartKind.Drums, notes: [] }] as IChart[];
        }
    }
    private getChartKey() {
        return `chart_${this.trackId}`;
    }
}

export enum ChartKind {
    Drums = 'drums',
    Guitar = 'guitar',
    Bass = 'bass'
}

export interface IChart {
    kind: ChartKind;
    notes: INote[][];
}

export interface INote {
    noteId: string;
    beatIndex: number;
    divisions: number;
    lineIndex: number;
}
