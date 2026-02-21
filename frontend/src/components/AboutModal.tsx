import { Modal } from "react-bootstrap";

interface AboutModalProps {
  show: boolean;
  onHide: () => void;
}

export function AboutModal({ show, onHide }: AboutModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>درباره مرزنگار</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>مرزنگار</strong> ابزاری تعاملی برای مشاهده مرزهای تاریخی جهان
          از ۱۲۳٬۰۰۰ سال پیش از میلاد تا امروز است.
        </p>

        <h6>منبع داده</h6>
        <p>
          داده‌های جغرافیایی از پروژه{" "}
          <a
            href="https://github.com/aourednik/historical-basemaps"
            target="_blank"
            rel="noopener noreferrer"
          >
            Historical Basemaps
          </a>{" "}
          گردآوری‌شده توسط{" "}
          <a
            href="https://ourednik.info/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Anouk Ourednik
          </a>{" "}
          برگرفته شده و نام‌ها به فارسی ترجمه شده‌اند.
        </p>

        <h6>فناوری</h6>
        <p>
          نقشه‌ها با استفاده از{" "}
          <a
            href="https://maplibre.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            MapLibre GL
          </a>{" "}
          و فرمت{" "}
          <a
            href="https://protomaps.com/docs/pmtiles"
            target="_blank"
            rel="noopener noreferrer"
          >
            PMTiles
          </a>{" "}
          نمایش داده می‌شوند.
        </p>

        <h6>کد منبع</h6>
        <p>
          <a
            href="https://github.com/aminalaee/marznegar"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/aminalaee/marznegar
          </a>
        </p>
      </Modal.Body>
    </Modal>
  );
}
