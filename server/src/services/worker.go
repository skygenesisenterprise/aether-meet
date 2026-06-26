package services

import (
	"context"
	"log/slog"
	"time"
)

type Worker struct {
	logger *slog.Logger
}

func NewWorker(logger *slog.Logger) *Worker {
	return &Worker{logger: logger}
}

func (w *Worker) Run(ctx context.Context) error {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	w.logger.Info("worker started", "service", "worker")
	for {
		select {
		case <-ctx.Done():
			w.logger.Info("worker stopped", "service", "worker")
			return nil
		case <-ticker.C:
			w.logger.Debug("worker tick", "service", "worker")
		}
	}
}
