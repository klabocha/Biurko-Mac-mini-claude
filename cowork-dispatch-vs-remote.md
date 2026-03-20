# Cowork Dispatch vs Claude Code Remote — wyjaśnienie

## Kluczowa różnica

| | **Claude Code Remote** | **Cowork Dispatch** |
|---|---|---|
| **Dla kogo** | Deweloperzy (terminal) | Profesjonaliści (GUI, biuro) |
| **Gdzie działa** | W terminalu, SSH, kod | Claude Desktop app, 38+ konektorów |
| **Co robi** | Pisze/edytuje kod, uruchamia testy | Automatyzuje zadania biurowe — pliki, email, Slack |
| **Interfejs** | Terminal + przeglądarka | Wizualny, bez kodu |
| **Kontekst** | Sesja kodowania | Persistent conversation (ciągła rozmowa) |

## Jako użytkownik terminala na Mac — dlaczego Dispatch może się przydać?

**Claude Code Remote** = kiedy kodujesz. Odpalisz `claude --remote-control`, otworzysz sesję na telefonie i kontynuujesz review kodu z kanapy.

**Cowork Dispatch** = kiedy NIE kodujesz. To dla zadań, które nie dotyczą kodu.

## Praktyczne pomysły na Dispatch (dla dewelopera na Macu)

1. **"Przygotuj mi brief z tych 5 PDF-ów na pulpicie"** — zlecasz z telefonu, Claude przetwarza lokalne pliki na desktopie
2. **"Sprawdź moje maile i podsumuj co ważnego przyszło od klienta X"** — przez konektor email, bez otwierania laptopa
3. **"Sformatuj ten CSV z danymi i zrób tabelę w Google Sheets"** — integracja z konektorami
4. **"Przejrzyj notatki z folderu ~/Documents/meetings i przygotuj action items"** — praca na lokalnych plikach
5. **"Przypomnij mi o deploy'u o 15:00"** — zaplanowane zadania (scheduled tasks)
6. **"Wyślij na Slacka status update do zespołu"** — przez konektor Slack

## Kiedy co wybrać?

- **Piszesz kod?** → Claude Code Remote (terminal)
- **Zadanie biurowe?** → Cowork Dispatch (telefon → desktop)
- **Równoległe zadania kodowe?** → Claude Code na web (cloud)

## Ważne ograniczenie

Dispatch **wymaga**, żeby Mac był obudzony i Claude Desktop app był otwarty. Jeśli Mac śpi — zadanie nie ruszy. To nie jest serwis w chmurze.

## Podsumowanie

Skoro głównie pracujesz w terminalu — **Claude Code Remote to Twoje główne narzędzie do kodu**. Dispatch jest uzupełnieniem na zadania pozakodowe. Nie zastępują się nawzajem — uzupełniają się.
