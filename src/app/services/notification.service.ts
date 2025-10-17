import { inject, Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly snackBar = inject(MatSnackBar);

    showError(message: string): void {
        console.log(message);
        this.snackBar.open(message, 'Close', {
            horizontalPosition: 'right',
            duration: 3000
        });
    }
}