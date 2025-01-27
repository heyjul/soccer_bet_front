import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, first, map, Observable } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/room.service';
import { CreateRoomDialogComponent } from '../create-room-dialog/create-room-dialog.component';
import { JoinRoomDialogComponent } from '../join-room-dialog/join-room-dialog.component';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private roomService: RoomService,
  ) { }

  private _rooms$!: BehaviorSubject<Room[]>;
  get rooms$(): Observable<Room[]> {
    return this._rooms$.asObservable();
  }

  actions = [
    { message: 'SUPPRIMER', color: '#f44336' },
  ];

  ngOnInit(): void {
    this.route.data.pipe(
      first(),
      map(data => new BehaviorSubject(data['rooms'])),
    ).subscribe(subject => this._rooms$ = subject);
  }

  openRoom(roomId: string): void {
    this.router.navigateByUrl(`/rooms/${roomId}`);
  }

  openCreateRoomDialog(): void {
    const dialogRef = this.dialog.open(CreateRoomDialogComponent, {
      width: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result)
        this.roomService.create(result).subscribe(res => {
          this._rooms$.value.push(res);
          this._rooms$.next(this._rooms$.value);
        });
    });
  }

  openJoinRoomDialog(): void {
    const dialogRef = this.dialog.open(JoinRoomDialogComponent, {
      width: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result)
        this.roomService.join(result).subscribe(res => {
          this._rooms$.value.push(res);
          this._rooms$.next(this._rooms$.value);
        });
    });
  }

  onSwipe(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '80%',
      data: 'Es-tu sûr de vouloir supprimer cette salle ?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
        this.roomService.delete(id).subscribe(() => this._rooms$.next(this._rooms$.value.filter(x => x.id !== id)));
    });
  }
}
