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
