"""Mini checkout: price calculation for the Omnigent workshop.

All amounts are integer cents so there are no floating-point rounding errors.
"""

from __future__ import annotations

from dataclasses import dataclass

# VAT rates in percent.
VAT_RATES: dict[str, int] = {"standard": 19, "reduced": 7}


@dataclass(frozen=True)
class Item:
    """A cart line. ``unit_price_cents`` is the net price per unit."""

    name: str
    unit_price_cents: int
    quantity: int = 1
    vat: str = "standard"

    def __post_init__(self) -> None:
        if self.unit_price_cents < 0:
            raise ValueError(f"{self.name}: price must not be negative")
        if self.quantity < 1:
            raise ValueError(f"{self.name}: quantity must be at least 1")
        if self.vat not in VAT_RATES:
            raise ValueError(f"{self.name}: unknown VAT rate {self.vat!r}")


@dataclass(frozen=True)
class Total:
    net_cents: int
    vat_cents: int

    @property
    def gross_cents(self) -> int:
        return self.net_cents + self.vat_cents


def round_half_up_div(numerator: int, denominator: int) -> int:
    """Integer division rounded half up (0.5 rounds up)."""
    return (2 * numerator + denominator) // (2 * denominator)


def line_net_cents(item: Item) -> int:
    return item.unit_price_cents * item.quantity


def cart_total(items: list[Item]) -> Total:
    """Sum up net and VAT of a cart.

    VAT is computed per rate on that rate's net subtotal (not per line),
    the way it is shown on an invoice.
    """
    net_by_rate: dict[str, int] = {}
    for item in items:
        net_by_rate[item.vat] = net_by_rate.get(item.vat, 0) + line_net_cents(item)

    net = sum(net_by_rate.values())
    vat = sum(
        round_half_up_div(rate_net * VAT_RATES[rate], 100)
        for rate, rate_net in net_by_rate.items()
    )
    return Total(net_cents=net, vat_cents=vat)


def format_eur(cents: int) -> str:
    """1234 -> '12.34 EUR'"""
    sign = "-" if cents < 0 else ""
    cents = abs(cents)
    return f"{sign}{cents // 100}.{cents % 100:02d} EUR"
