import { inject, Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly snackBar = inject(MatSnackBar);

    showNotification(message: string): void {
        this.snackBar.open(message, 'Close', {
            horizontalPosition: 'right',
            duration: 3000
        });
    }
}