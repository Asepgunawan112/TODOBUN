# TODO Bun

## Menjalankan aplikasi

Jalankan perintah dari folder `app`:

```bash
bun install
bun run db:push
bun run dev
```

Pastikan file `.env` berisi `TURSO_DATABASE` (URL database Turso) dan
`TURSO_AUTH_TOKEN` (token akses Turso). Buka [http://localhost:3000](http://localhost:3000)
setelah server menampilkan alamat tersebut.

`db:push` menyelaraskan tabel dari `src/db/schema.ts` ke database Turso.
